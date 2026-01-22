using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetClubStatistics.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Queries.GetClubStatistics;

/// <summary>
/// Query to get club statistics including matches, players, and performance metrics
/// </summary>
public record GetClubStatisticsQuery(Guid ClubId) : IQuery<ClubStatisticsDto>;

/// <summary>
/// Handler for GetClubStatisticsQuery
/// </summary>
public class GetClubStatisticsHandler : IRequestHandler<GetClubStatisticsQuery, ClubStatisticsDto>
{
    private readonly OurGameContext _db;

    public GetClubStatisticsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ClubStatisticsDto> Handle(GetClubStatisticsQuery query, CancellationToken cancellationToken)
    {
        // Get basic stats
        var basicStatsSql = @"
            SELECT 
                COUNT(DISTINCT p.Id) AS PlayerCount,
                COUNT(DISTINCT t.Id) AS TeamCount,
                COUNT(DISTINCT ag.Id) AS AgeGroupCount
            FROM Clubs c
            LEFT JOIN AgeGroups ag ON ag.ClubId = c.Id AND ag.IsArchived = 0
            LEFT JOIN Teams t ON t.ClubId = c.Id AND t.IsArchived = 0
            LEFT JOIN PlayerAgeGroups pag ON pag.AgeGroupId = ag.Id
            LEFT JOIN Players p ON p.Id = pag.PlayerId AND p.IsArchived = 0
            WHERE c.Id = {0}";

        var basicStats = await _db.Database
            .SqlQueryRaw<BasicStatsRawDto>(basicStatsSql, query.ClubId)
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
            WHERE t.ClubId = {0} AND t.IsArchived = 0";

        var matchStats = await _db.Database
            .SqlQueryRaw<MatchStatsRawDto>(matchStatsSql, query.ClubId)
            .FirstOrDefaultAsync(cancellationToken);

        // Get upcoming matches (next 5)
        var upcomingMatchesSql = @"
            SELECT TOP 5
                m.Id,
                m.TeamId,
                t.AgeGroupId,
                m.Opposition,
                m.MatchDate,
                m.MeetTime,
                m.KickOffTime,
                m.Location,
                m.IsHome,
                m.Competition,
            NULL AS HomeScore,
            NULL AS AwayScore,
                t.Name AS TeamName,
                ag.Name AS AgeGroupName
            FROM Matches m
            INNER JOIN Teams t ON m.TeamId = t.Id
            INNER JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            WHERE t.ClubId = {0} 
                AND m.Status = 0
                AND m.MatchDate >= GETUTCDATE()
                AND t.IsArchived = 0
            ORDER BY m.MatchDate ASC";

        var upcomingMatches = await _db.Database
            .SqlQueryRaw<MatchSummaryRawDto>(upcomingMatchesSql, query.ClubId)
            .ToListAsync(cancellationToken);

        // Get recent results (last 5)
        var recentResultsSql = @"
            SELECT TOP 5
                m.Id,
                m.TeamId,
                t.AgeGroupId,
                m.Opposition,
                m.MatchDate,
                m.MeetTime,
                m.KickOffTime,
                m.Location,
                m.IsHome,
                m.Competition,
                m.HomeScore,
                m.AwayScore,
                t.Name AS TeamName,
                ag.Name AS AgeGroupName
            FROM Matches m
            INNER JOIN Teams t ON m.TeamId = t.Id
            INNER JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            WHERE t.ClubId = {0} 
                AND m.Status = 2
                AND t.IsArchived = 0
            ORDER BY m.MatchDate DESC";

        var recentResults = await _db.Database
            .SqlQueryRaw<MatchSummaryRawDto>(recentResultsSql, query.ClubId)
            .ToListAsync(cancellationToken);

        var wins = matchStats?.Wins ?? 0;
        var draws = matchStats?.Draws ?? 0;
        var losses = matchStats?.Losses ?? 0;
        var matchesPlayed = matchStats?.MatchesPlayed ?? 0;
        var goalsFor = matchStats?.GoalsFor ?? 0;
        var goalsAgainst = matchStats?.GoalsAgainst ?? 0;

        return new ClubStatisticsDto
        {
            PlayerCount = basicStats?.PlayerCount ?? 0,
            TeamCount = basicStats?.TeamCount ?? 0,
            AgeGroupCount = basicStats?.AgeGroupCount ?? 0,
            MatchesPlayed = matchesPlayed,
            Wins = wins,
            Draws = draws,
            Losses = losses,
            WinRate = matchesPlayed > 0 ? Math.Round((decimal)wins / matchesPlayed * 100, 1) : 0,
            GoalDifference = goalsFor - goalsAgainst,
            UpcomingMatches = upcomingMatches.Select(m => new MatchSummaryDto
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
            PreviousResults = recentResults.Select(m => new MatchSummaryDto
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
            }).ToList()
        };
    }
}

/// <summary>
/// DTO for basic stats raw SQL query result
/// </summary>
public class BasicStatsRawDto
{
    public int PlayerCount { get; set; }
    public int TeamCount { get; set; }
    public int AgeGroupCount { get; set; }
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
/// DTO for match summary raw SQL query result
/// </summary>
public class MatchSummaryRawDto
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
