using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerUpcomingMatches.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayerUpcomingMatches;

/// <summary>
/// Query to get upcoming matches for a player
/// </summary>
public record GetPlayerUpcomingMatchesQuery(
    Guid PlayerId, 
    string? UserId = null,
    int? Limit = 5) : IQuery<List<PlayerUpcomingMatchDto>?>;

/// <summary>
/// Handler for GetPlayerUpcomingMatchesQuery.
/// Returns upcoming scheduled matches for all teams the player is assigned to.
/// Implements same authorization rules as GetPlayerById.
/// </summary>
public class GetPlayerUpcomingMatchesHandler : IRequestHandler<GetPlayerUpcomingMatchesQuery, List<PlayerUpcomingMatchDto>?>
{
    private readonly OurGameContext _db;

    public GetPlayerUpcomingMatchesHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<PlayerUpcomingMatchDto>?> Handle(GetPlayerUpcomingMatchesQuery query, CancellationToken cancellationToken)
    {
        // Authorization check: verify user has access to this player
        if (!string.IsNullOrEmpty(query.UserId))
        {
            var authSql = @"
                SELECT CASE WHEN EXISTS (
                    -- User is a coach assigned to any team the player is in
                    SELECT 1
                    FROM Players p
                    INNER JOIN PlayerTeams pt ON p.Id = pt.PlayerId
                    INNER JOIN Teams t ON pt.TeamId = t.Id
                    INNER JOIN TeamCoaches tc ON t.Id = tc.TeamId
                    INNER JOIN Coaches c ON tc.CoachId = c.Id
                    INNER JOIN Users u ON c.UserId = u.Id
                    WHERE p.Id = {0} AND u.AuthId = {1}
                    
                    UNION
                    
                    -- User is the player's own linked user
                    SELECT 1
                    FROM Players p
                    INNER JOIN Users u ON p.UserId = u.Id
                    WHERE p.Id = {0} AND u.AuthId = {1}
                    
                    UNION
                    
                    -- User is a parent of the player
                    SELECT 1
                    FROM Players p
                    INNER JOIN PlayerParents pp ON p.Id = pp.PlayerId
                    INNER JOIN Users u ON pp.ParentUserId = u.Id
                    WHERE p.Id = {0} AND u.AuthId = {1}
                ) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS HasAccess";

            var hasAccess = await _db.Database
                .SqlQueryRaw<AuthCheckResult>(authSql, query.PlayerId, query.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            if (hasAccess == null || !hasAccess.HasAccess)
            {
                return null; // Return 404 to not leak existence
            }
        }

        // Fetch upcoming matches for player's teams
        var limit = query.Limit ?? 5;
        var upcomingMatchesSql = @"
            SELECT TOP ({1})
                m.Id AS MatchId,
                m.TeamId,
                t.AgeGroupId,
                t.Name AS TeamName,
                ag.Name AS AgeGroupName,
                m.MatchDate,
                m.KickOffTime AS KickoffTime,
                m.Opposition AS Opponent,
                m.IsHome,
                m.Location AS Venue,
                m.Competition
            FROM PlayerTeams pt
            INNER JOIN Teams t ON pt.TeamId = t.Id
            LEFT JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            INNER JOIN Matches m ON m.TeamId = t.Id
            WHERE pt.PlayerId = {0}
                AND m.MatchDate >= GETUTCDATE()
                AND m.Status = 0
            ORDER BY m.MatchDate ASC, m.KickOffTime ASC";

        var matches = await _db.Database
            .SqlQueryRaw<PlayerUpcomingMatchRawDto>(upcomingMatchesSql, query.PlayerId, limit)
            .ToListAsync(cancellationToken);

        // Map to response DTOs
        var result = matches
            .Select(m => new PlayerUpcomingMatchDto
            {
                MatchId = m.MatchId,
                TeamId = m.TeamId,
                AgeGroupId = m.AgeGroupId,
                TeamName = m.TeamName ?? string.Empty,
                AgeGroupName = m.AgeGroupName ?? string.Empty,
                MatchDate = m.MatchDate,
                KickoffTime = m.KickoffTime,
                Opponent = m.Opponent ?? "TBD",
                IsHome = m.IsHome,
                Venue = m.Venue,
                Competition = m.Competition
            })
            .ToList();

        return result;
    }
}

/// <summary>
/// Raw DTO for authorization check
/// </summary>
public class AuthCheckResult
{
    public bool HasAccess { get; set; }
}

/// <summary>
/// Raw SQL result for player upcoming matches query
/// </summary>
public class PlayerUpcomingMatchRawDto
{
    public Guid MatchId { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? TeamName { get; set; }
    public string? AgeGroupName { get; set; }
    public DateTime MatchDate { get; set; }
    public DateTime? KickoffTime { get; set; }
    public string? Opponent { get; set; }
    public bool IsHome { get; set; }
    public string? Venue { get; set; }
    public string? Competition { get; set; }
}
