using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Clubs.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries;

/// <summary>
/// Handler for GetClubAgeGroupsQuery
/// </summary>
public class GetClubAgeGroupsHandler : IRequestHandler<GetClubAgeGroupsQuery, List<AgeGroupListItemDto>>
{
    private readonly OurGameContext _db;

    public GetClubAgeGroupsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<AgeGroupListItemDto>> Handle(GetClubAgeGroupsQuery query, CancellationToken cancellationToken)
    {
        // Verify club exists
        var clubExists = await _db.Clubs
            .AnyAsync(c => c.Id == query.ClubId, cancellationToken);

        if (!clubExists)
        {
            throw new NotFoundException($"Club with ID {query.ClubId} not found");
        }

        // Build the main query for age groups with counts
        var ageGroupsQuery = _db.AgeGroups
            .AsNoTracking()
            .Where(ag => ag.ClubId == query.ClubId);

        // Apply archived filter
        if (!query.IncludeArchived)
        {
            ageGroupsQuery = ageGroupsQuery.Where(ag => !ag.IsArchived);
        }

        // Apply season filter if provided
        if (!string.IsNullOrEmpty(query.Season))
        {
            ageGroupsQuery = ageGroupsQuery.Where(ag => ag.CurrentSeason == query.Season);
        }

        // Fetch age groups with team and player counts
        var ageGroups = await ageGroupsQuery
            .Select(ag => new
            {
                AgeGroup = ag,
                TeamCount = ag.Teams.Count(t => !t.IsArchived),
                PlayerCount = ag.PlayerAgeGroups.Count(pag => !pag.Player.IsArchived)
            })
            .ToListAsync(cancellationToken);

        // Get all age group IDs
        var ageGroupIds = ageGroups.Select(ag => ag.AgeGroup.Id).ToList();

        // Fetch coordinators for all age groups in one query
        var coordinators = await _db.AgeGroupCoordinators
            .AsNoTracking()
            .Where(agc => ageGroupIds.Contains(agc.AgeGroupId))
            .Include(agc => agc.Coach)
            .ToListAsync(cancellationToken);

        // Group coordinators by age group
        var coordinatorsByAgeGroup = coordinators
            .GroupBy(agc => agc.AgeGroupId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(agc => new CoordinatorDto
                {
                    Id = agc.Coach.Id,
                    FirstName = agc.Coach.FirstName,
                    LastName = agc.Coach.LastName
                }).ToList()
            );

        // Map to DTOs
        var result = ageGroups.Select(ag => new AgeGroupListItemDto
        {
            Id = ag.AgeGroup.Id,
            ClubId = ag.AgeGroup.ClubId,
            Name = ag.AgeGroup.Name,
            Code = ag.AgeGroup.Code,
            Level = ag.AgeGroup.Level.ToString().ToLower(),
            Season = ag.AgeGroup.CurrentSeason,
            Seasons = ParseSeasons(ag.AgeGroup.Seasons),
            DefaultSquadSize = (int)ag.AgeGroup.DefaultSquadSize,
            Description = ag.AgeGroup.Description,
            Coordinators = coordinatorsByAgeGroup.ContainsKey(ag.AgeGroup.Id) 
                ? coordinatorsByAgeGroup[ag.AgeGroup.Id] 
                : new List<CoordinatorDto>(),
            TeamCount = ag.TeamCount,
            PlayerCount = ag.PlayerCount,
            IsArchived = ag.AgeGroup.IsArchived
        }).ToList();

        // Order by level (senior -> reserve -> amateur -> youth) then by code descending
        result = result
            .OrderBy(ag => GetLevelOrder(ag.Level))
            .ThenByDescending(ag => ag.Code)
            .ToList();

        return result;
    }

    /// <summary>
    /// Parse comma-separated seasons string into a list
    /// </summary>
    private List<string> ParseSeasons(string seasonsString)
    {
        if (string.IsNullOrEmpty(seasonsString))
        {
            return new List<string>();
        }

        return seasonsString
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .ToList();
    }

    /// <summary>
    /// Get sorting order for level (senior first, youth last)
    /// </summary>
    private int GetLevelOrder(string level)
    {
        return level?.ToLower() switch
        {
            "senior" => 1,
            "reserve" => 2,
            "amateur" => 3,
            "youth" => 4,
            _ => 5
        };
    }
}
