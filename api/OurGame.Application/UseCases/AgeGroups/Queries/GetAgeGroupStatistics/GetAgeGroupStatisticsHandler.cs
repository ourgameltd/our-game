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

        var upcomingMatchesSql = @"
            SELECT TOP 5
                m.Id,
                m.TeamId,
                t.AgeGroupId,
                t.Name AS TeamName,
                ag.Name AS AgeGroupName,
                m.Opposition,
                m.MatchDate,
                m.MeetTime,
                m.KickOffTime,
                m.Location,
                m.IsHome,
                m.Competition,
                NULL AS HomeScore,
                NULL AS AwayScore
            FROM Matches m
            INNER JOIN Teams t ON m.TeamId = t.Id
            INNER JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            WHERE t.AgeGroupId = {0}
                AND m.Status = 0
                AND m.MatchDate >= GETUTCDATE()
                AND t.IsArchived = 0
            ORDER BY m.MatchDate ASC";

        var upcomingMatches = await _db.Database
            .SqlQueryRaw<AgeGroupMatchRawDto>(upcomingMatchesSql, query.AgeGroupId)
            .ToListAsync(cancellationToken);

        var recentResultsSql = @"
            SELECT TOP 5
                m.Id,
                m.TeamId,
                t.AgeGroupId,
                t.Name AS TeamName,
                ag.Name AS AgeGroupName,
                m.Opposition,
                m.MatchDate,
                m.MeetTime,
                m.KickOffTime,
                m.Location,
                m.IsHome,
                m.Competition,
                m.HomeScore,
                m.AwayScore
            FROM Matches m
            INNER JOIN Teams t ON m.TeamId = t.Id
            INNER JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            WHERE t.AgeGroupId = {0}
                AND m.Status = 2
                AND t.IsArchived = 0
            ORDER BY m.MatchDate DESC";

        var recentResults = await _db.Database
            .SqlQueryRaw<AgeGroupMatchRawDto>(recentResultsSql, query.AgeGroupId)
            .ToListAsync(cancellationToken);

        var topPerformersSql = @"
            SELECT TOP 5
                pr.PlayerId,
                p.FirstName,
                p.LastName,
                CAST(AVG(CAST(pr.Rating AS decimal(5,2))) AS decimal(5,2)) AS AverageRating,
                COUNT(pr.Id) AS MatchesPlayed
            FROM PerformanceRatings pr
            INNER JOIN MatchReports mr ON pr.MatchReportId = mr.Id
            INNER JOIN Matches m ON mr.MatchId = m.Id
            INNER JOIN Teams t ON m.TeamId = t.Id
            INNER JOIN Players p ON pr.PlayerId = p.Id
            WHERE t.AgeGroupId = {0}
                AND m.Status = 2
                AND pr.Rating IS NOT NULL
                AND p.IsArchived = 0
            GROUP BY pr.PlayerId, p.FirstName, p.LastName
            HAVING COUNT(pr.Id) >= 3
            ORDER BY AverageRating DESC";

        var topPerformers = await _db.Database
            .SqlQueryRaw<AgeGroupPerformerRawDto>(topPerformersSql, query.AgeGroupId)
            .ToListAsync(cancellationToken);

        var underperformingSql = @"
            SELECT TOP 5
                pr.PlayerId,
                p.FirstName,
                p.LastName,
                CAST(AVG(CAST(pr.Rating AS decimal(5,2))) AS decimal(5,2)) AS AverageRating,
                COUNT(pr.Id) AS MatchesPlayed
            FROM PerformanceRatings pr
            INNER JOIN MatchReports mr ON pr.MatchReportId = mr.Id
            INNER JOIN Matches m ON mr.MatchId = m.Id
            INNER JOIN Teams t ON m.TeamId = t.Id
            INNER JOIN Players p ON pr.PlayerId = p.Id
            WHERE t.AgeGroupId = {0}
                AND m.Status = 2
                AND pr.Rating IS NOT NULL
                AND p.IsArchived = 0
            GROUP BY pr.PlayerId, p.FirstName, p.LastName
            HAVING COUNT(pr.Id) >= 3 AND AVG(CAST(pr.Rating AS decimal(5,2))) < 6.0
            ORDER BY AverageRating ASC";

        var underperforming = await _db.Database
            .SqlQueryRaw<AgeGroupPerformerRawDto>(underperformingSql, query.AgeGroupId)
            .ToListAsync(cancellationToken);

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
            GoalDifference = goalsFor - goalsAgainst,
            UpcomingMatches = upcomingMatches.Select(m => new AgeGroupMatchSummaryDto
            {
                Id = m.Id,
                TeamId = m.TeamId,
                AgeGroupId = m.AgeGroupId,
                TeamName = m.TeamName ?? string.Empty,
                AgeGroupName = m.AgeGroupName ?? string.Empty,
                Opposition = m.Opposition ?? string.Empty,
                Date = m.MatchDate,
                MeetTime = m.MeetTime,
                KickOffTime = m.KickOffTime,
                Location = m.Location ?? string.Empty,
                IsHome = m.IsHome,
                Competition = m.Competition,
                Score = null
            }).ToList(),
            PreviousResults = recentResults.Select(m => new AgeGroupMatchSummaryDto
            {
                Id = m.Id,
                TeamId = m.TeamId,
                AgeGroupId = m.AgeGroupId,
                TeamName = m.TeamName ?? string.Empty,
                AgeGroupName = m.AgeGroupName ?? string.Empty,
                Opposition = m.Opposition ?? string.Empty,
                Date = m.MatchDate,
                MeetTime = m.MeetTime,
                KickOffTime = m.KickOffTime,
                Location = m.Location ?? string.Empty,
                IsHome = m.IsHome,
                Competition = m.Competition,
                Score = m.HomeScore.HasValue && m.AwayScore.HasValue
                    ? new MatchScoreDto { Home = m.HomeScore.Value, Away = m.AwayScore.Value }
                    : null
            }).ToList(),
            TopPerformers = topPerformers.Select(p => new AgeGroupPerformerDto
            {
                PlayerId = p.PlayerId,
                FirstName = p.FirstName ?? string.Empty,
                LastName = p.LastName ?? string.Empty,
                AverageRating = p.AverageRating,
                MatchesPlayed = p.MatchesPlayed
            }).ToList(),
            Underperforming = underperforming.Select(p => new AgeGroupPerformerDto
            {
                PlayerId = p.PlayerId,
                FirstName = p.FirstName ?? string.Empty,
                LastName = p.LastName ?? string.Empty,
                AverageRating = p.AverageRating,
                MatchesPlayed = p.MatchesPlayed
            }).ToList()
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

/// <summary>
/// DTO for match summary raw SQL result
/// </summary>
public class AgeGroupMatchRawDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? TeamName { get; set; }
    public string? AgeGroupName { get; set; }
    public string? Opposition { get; set; }
    public DateTime MatchDate { get; set; }
    public DateTime? MeetTime { get; set; }
    public DateTime? KickOffTime { get; set; }
    public string? Location { get; set; }
    public bool IsHome { get; set; }
    public string? Competition { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
}

/// <summary>
/// DTO for performer raw SQL result
/// </summary>
public class AgeGroupPerformerRawDto
{
    public Guid PlayerId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public decimal AverageRating { get; set; }
    public int MatchesPlayed { get; set; }
}
