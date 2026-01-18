using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries;

/// <summary>
/// Handler for GetClubPlayersQuery
/// </summary>
public class GetClubPlayersHandler : IRequestHandler<GetClubPlayersQuery, PagedResponse<PlayerListItemDto>>
{
    private readonly OurGameContext _db;

    public GetClubPlayersHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PagedResponse<PlayerListItemDto>> Handle(GetClubPlayersQuery query, CancellationToken cancellationToken)
    {
        // Verify club exists
        var clubExists = await _db.Clubs
            .AnyAsync(c => c.Id == query.ClubId, cancellationToken);

        if (!clubExists)
        {
            throw new NotFoundException($"Club with ID {query.ClubId} not found");
        }

        // Validate page and pageSize
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        // Build the main query for players
        var playersQuery = _db.Players
            .AsNoTracking()
            .Where(p => p.ClubId == query.ClubId);

        // Apply age group filter if provided
        if (query.AgeGroupId.HasValue)
        {
            playersQuery = playersQuery.Where(p => 
                p.PlayerAgeGroups.Any(pag => pag.AgeGroupId == query.AgeGroupId.Value));
        }

        // Apply team filter if provided
        if (query.TeamId.HasValue)
        {
            playersQuery = playersQuery.Where(p => 
                p.PlayerTeams.Any(pt => pt.TeamId == query.TeamId.Value));
        }

        // Apply position filter if provided
        if (!string.IsNullOrEmpty(query.Position))
        {
            playersQuery = playersQuery.Where(p => 
                p.PreferredPositions != null && p.PreferredPositions.Contains(query.Position));
        }

        // Apply search filter if provided
        if (!string.IsNullOrEmpty(query.Search))
        {
            var searchLower = query.Search.ToLower();
            playersQuery = playersQuery.Where(p => 
                p.FirstName.ToLower().Contains(searchLower) || 
                p.LastName.ToLower().Contains(searchLower));
        }

        // Apply archived filter
        if (!query.IncludeArchived)
        {
            playersQuery = playersQuery.Where(p => !p.IsArchived);
        }

        // Get total count before pagination
        var totalCount = await playersQuery.CountAsync(cancellationToken);

        if (totalCount == 0)
        {
            return PagedResponse<PlayerListItemDto>.Create(
                new List<PlayerListItemDto>(), 
                page, 
                pageSize, 
                0);
        }

        // Apply ordering and pagination
        var players = await playersQuery
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                Player = p,
                AgeGroupIds = p.PlayerAgeGroups.Select(pag => pag.AgeGroupId).ToList(),
                TeamIds = p.PlayerTeams.Select(pt => pt.TeamId).ToList()
            })
            .ToListAsync(cancellationToken);

        // Get player IDs
        var playerIds = players.Select(p => p.Player.Id).ToList();

        // Fetch age groups for all players in one query
        var ageGroupsLookup = await _db.PlayerAgeGroups
            .AsNoTracking()
            .Where(pag => playerIds.Contains(pag.PlayerId))
            .Include(pag => pag.AgeGroup)
            .GroupBy(pag => pag.PlayerId)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Select(pag => pag.AgeGroup.Name).ToList(),
                cancellationToken);

        // Fetch teams for all players in one query
        var teamsLookup = await _db.PlayerTeams
            .AsNoTracking()
            .Where(pt => playerIds.Contains(pt.PlayerId))
            .Include(pt => pt.Team)
            .GroupBy(pt => pt.PlayerId)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Select(pt => pt.Team.Name).ToList(),
                cancellationToken);

        // Map to DTOs
        var result = players.Select(p => new PlayerListItemDto
        {
            Id = p.Player.Id,
            ClubId = p.Player.ClubId,
            FirstName = p.Player.FirstName,
            LastName = p.Player.LastName,
            DateOfBirth = p.Player.DateOfBirth,
            Age = p.Player.DateOfBirth.HasValue 
                ? CalculateAge(p.Player.DateOfBirth.Value) 
                : null,
            Photo = p.Player.Photo,
            PreferredPositions = ParsePositions(p.Player.PreferredPositions),
            AgeGroups = ageGroupsLookup.GetValueOrDefault(p.Player.Id, new List<string>()),
            Teams = teamsLookup.GetValueOrDefault(p.Player.Id, new List<string>()),
            OverallRating = p.Player.OverallRating,
            IsArchived = p.Player.IsArchived
        })
        .ToList();

        return PagedResponse<PlayerListItemDto>.Create(result, page, pageSize, totalCount);
    }

    /// <summary>
    /// Calculate age from date of birth
    /// </summary>
    private static int CalculateAge(DateOnly dateOfBirth)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var age = today.Year - dateOfBirth.Year;
        
        if (dateOfBirth > today.AddYears(-age))
        {
            age--;
        }
        
        return age;
    }

    /// <summary>
    /// Parse comma-separated positions string into list
    /// </summary>
    private static List<string> ParsePositions(string? positions)
    {
        if (string.IsNullOrEmpty(positions))
        {
            return new List<string>();
        }

        return positions
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Trim())
            .Where(p => !string.IsNullOrEmpty(p))
            .ToList();
    }
}
