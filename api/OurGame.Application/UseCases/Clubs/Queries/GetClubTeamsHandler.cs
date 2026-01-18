using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Clubs.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries;

/// <summary>
/// Handler for GetClubTeamsQuery
/// </summary>
public class GetClubTeamsHandler : IRequestHandler<GetClubTeamsQuery, List<TeamListItemDto>>
{
    private readonly OurGameContext _db;

    public GetClubTeamsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<TeamListItemDto>> Handle(GetClubTeamsQuery query, CancellationToken cancellationToken)
    {
        // Verify club exists
        var clubExists = await _db.Clubs
            .AnyAsync(c => c.Id == query.ClubId, cancellationToken);

        if (!clubExists)
        {
            throw new NotFoundException($"Club with ID {query.ClubId} not found");
        }

        // Build the main query for teams with player counts
        var teamsQuery = _db.Teams
            .AsNoTracking()
            .Where(t => t.ClubId == query.ClubId);

        // Apply age group filter if provided
        if (query.AgeGroupId.HasValue)
        {
            teamsQuery = teamsQuery.Where(t => t.AgeGroupId == query.AgeGroupId.Value);
        }

        // Apply archived filter
        if (!query.IncludeArchived)
        {
            teamsQuery = teamsQuery.Where(t => !t.IsArchived);
        }

        // Apply season filter if provided
        if (!string.IsNullOrEmpty(query.Season))
        {
            teamsQuery = teamsQuery.Where(t => t.Season == query.Season);
        }

        // Fetch teams with age group information and player counts
        var teams = await teamsQuery
            .Include(t => t.AgeGroup)
            .Select(t => new
            {
                Team = t,
                PlayerCount = t.PlayerTeams.Count(pt => !pt.Player.IsArchived)
            })
            .ToListAsync(cancellationToken);

        if (teams.Count == 0)
        {
            return new List<TeamListItemDto>();
        }

        // Get all team IDs
        var teamIds = teams.Select(t => t.Team.Id).ToList();

        // Fetch coaches for all teams in one query
        var teamCoaches = await _db.TeamCoaches
            .AsNoTracking()
            .Where(tc => teamIds.Contains(tc.TeamId))
            .Include(tc => tc.Coach)
            .ToListAsync(cancellationToken);

        // Group coaches by team
        var coachesByTeam = teamCoaches
            .GroupBy(tc => tc.TeamId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(tc => new TeamCoachDto
                {
                    Id = tc.Coach.Id,
                    FirstName = tc.Coach.FirstName,
                    LastName = tc.Coach.LastName,
                    Role = "coach" // Role is not in database model yet
                }).ToList()
            );

        // Map to DTOs
        var result = teams.Select(t => new TeamListItemDto
        {
            Id = t.Team.Id,
            ClubId = t.Team.ClubId,
            AgeGroupId = t.Team.AgeGroupId,
            AgeGroupName = t.Team.AgeGroup.Name,
            Name = t.Team.Name,
            Colors = new TeamColorsDto
            {
                Primary = t.Team.PrimaryColor ?? "#000000",
                Secondary = t.Team.SecondaryColor ?? "#FFFFFF"
            },
            Season = t.Team.Season ?? string.Empty,
            SquadSize = (int)t.Team.AgeGroup.DefaultSquadSize,
            Coaches = coachesByTeam.GetValueOrDefault(t.Team.Id, new List<TeamCoachDto>()),
            PlayerCount = t.PlayerCount,
            IsArchived = t.Team.IsArchived
        })
        .OrderByDescending(t => t.AgeGroupName)
        .ThenBy(t => t.Name)
        .ToList();

        return result;
    }
}
