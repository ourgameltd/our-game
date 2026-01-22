using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupStatistics.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupStatistics;

/// <summary>
/// Query to get statistics for an age group
/// </summary>
public record GetAgeGroupStatisticsQuery(Guid AgeGroupId) : IQuery<AgeGroupStatisticsDto>;

/// <summary>
/// Handler for GetAgeGroupStatisticsQuery
/// </summary>
public class GetAgeGroupStatisticsHandler : IRequestHandler<GetAgeGroupStatisticsQuery, AgeGroupStatisticsDto>
{
    private readonly OurGameContext _db;

    public GetAgeGroupStatisticsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<AgeGroupStatisticsDto> Handle(GetAgeGroupStatisticsQuery query, CancellationToken cancellationToken)
    {
        // Get player count
        var playerCountSql = @"
            SELECT COALESCE(COUNT(DISTINCT p.Id), 0) AS PlayerCount
            FROM PlayerAgeGroups pag
            INNER JOIN Players p ON p.Id = pag.PlayerId
            WHERE pag.AgeGroupId = {0} AND p.IsArchived = 0";

        var playerCount = await _db.Database
            .SqlQueryRaw<PlayerCountRawDto>(playerCountSql, query.AgeGroupId)
            .FirstOrDefaultAsync(cancellationToken);

        // Get match statistics
        var matchStatsSql = @"
            SELECT 
                COUNT(CASE WHEN m.Status = 2 THEN 1 END) AS MatchesPlayed,
                COUNT(CASE WHEN m.Status = 2 AND m.IsHome = 1 AND m.HomeScore > m.AwayScore THEN 1 
                           WHEN m.Status = 2 AND m.IsHome = 0 AND m.AwayScore > m.HomeScore THEN 1 END) AS Wins,
                COUNT(CASE WHEN m.Status = 2 AND m.HomeScore = m.AwayScore THEN 1 END) AS Draws,
                COUNT(CASE WHEN m.Status = 2 AND m.IsHome = 1 AND m.HomeScore < m.AwayScore THEN 1 
                           WHEN m.Status = 2 AND m.IsHome = 0 AND m.AwayScore < m.HomeScore THEN 1 END) AS Losses,
                COALESCE(SUM(CASE WHEN m.IsHome = 1 THEN m.HomeScore ELSE m.AwayScore END), 0) AS GoalsFor,
                COALESCE(SUM(CASE WHEN m.IsHome = 1 THEN m.AwayScore ELSE m.HomeScore END), 0) AS GoalsAgainst
            FROM Teams t
            LEFT JOIN Matches m ON m.TeamId = t.Id
            WHERE t.AgeGroupId = {0} AND t.IsArchived = 0";

        var matchStats = await _db.Database
            .SqlQueryRaw<MatchStatsRawDto>(matchStatsSql, query.AgeGroupId)
            .FirstOrDefaultAsync(cancellationToken);

        var wins = matchStats?.Wins ?? 0;
        var draws = matchStats?.Draws ?? 0;
        var losses = matchStats?.Losses ?? 0;
        var matchesPlayed = matchStats?.MatchesPlayed ?? 0;
        var goalsFor = matchStats?.GoalsFor ?? 0;
        var goalsAgainst = matchStats?.GoalsAgainst ?? 0;

        return new AgeGroupStatisticsDto
        {
            PlayerCount = playerCount?.PlayerCount ?? 0,
            MatchesPlayed = matchesPlayed,
            Wins = wins,
            Draws = draws,
            Losses = losses,
            WinRate = matchesPlayed > 0 ? Math.Round((decimal)wins / matchesPlayed * 100, 1) : 0,
            GoalDifference = goalsFor - goalsAgainst
        };
    }
}

/// <summary>
/// DTO for player count raw SQL query result
/// </summary>
public class PlayerCountRawDto
{
    public int PlayerCount { get; set; }
}

/// <summary>
/// DTO for match stats raw SQL query result
/// </summary>
public class MatchStatsRawDto
{
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
    public int GoalsFor { get; set; }
    public int GoalsAgainst { get; set; }
}
