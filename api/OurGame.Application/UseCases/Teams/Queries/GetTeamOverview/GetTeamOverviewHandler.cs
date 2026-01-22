using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;
using OurGame.Persistence.Models;
using System.Text.Json;

namespace OurGame.Application.UseCases.Teams.Queries.GetTeamOverview;

/// <summary>
/// Query to get team overview data
/// </summary>
public record GetTeamOverviewQuery(Guid TeamId) : IQuery<TeamOverviewDto?>;

/// <summary>
/// Handler for GetTeamOverviewQuery
/// </summary>
public class GetTeamOverviewHandler : IRequestHandler<GetTeamOverviewQuery, TeamOverviewDto?>
{
    private readonly OurGameContext _db;

    public GetTeamOverviewHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<TeamOverviewDto?> Handle(GetTeamOverviewQuery query, CancellationToken cancellationToken)
    {
        var teamSql = @"
            SELECT
                t.Id,
                t.ClubId,
                t.AgeGroupId,
                t.Name,
                t.ShortName,
                t.Level,
                t.Season,
                t.PrimaryColor,
                t.SecondaryColor,
                t.IsArchived
            FROM Teams t
            WHERE t.Id = {0}";

        var team = await _db.Database
            .SqlQueryRaw<TeamOverviewTeamRawDto>(teamSql, query.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (team == null)
        {
            return null;
        }

        var playerCountSql = @"
            SELECT COALESCE(COUNT(DISTINCT pt.PlayerId), 0) AS PlayerCount
            FROM PlayerTeams pt
            INNER JOIN Players p ON p.Id = pt.PlayerId
            WHERE pt.TeamId = {0} AND p.IsArchived = 0";

        var playerCount = await _db.Database
            .SqlQueryRaw<TeamPlayerCountRawDto>(playerCountSql, query.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

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
            FROM Matches m
            WHERE m.TeamId = {0}";

        var matchStats = await _db.Database
            .SqlQueryRaw<TeamMatchStatsRawDto>(matchStatsSql, query.TeamId)
            .FirstOrDefaultAsync(cancellationToken);

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
                NULL AS AwayScore
            FROM Matches m
            INNER JOIN Teams t ON m.TeamId = t.Id
            WHERE m.TeamId = {0}
                AND m.Status = 0
                AND m.MatchDate >= GETUTCDATE()
            ORDER BY m.MatchDate ASC";

        var upcomingMatches = await _db.Database
            .SqlQueryRaw<TeamMatchRawDto>(upcomingMatchesSql, query.TeamId)
            .ToListAsync(cancellationToken);

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
                m.AwayScore
            FROM Matches m
            INNER JOIN Teams t ON m.TeamId = t.Id
            WHERE m.TeamId = {0}
                AND m.Status = 2
            ORDER BY m.MatchDate DESC";

        var recentResults = await _db.Database
            .SqlQueryRaw<TeamMatchRawDto>(recentResultsSql, query.TeamId)
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
            INNER JOIN Players p ON pr.PlayerId = p.Id
            WHERE m.TeamId = {0}
                AND m.Status = 2
                AND pr.Rating IS NOT NULL
                AND p.IsArchived = 0
            GROUP BY pr.PlayerId, p.FirstName, p.LastName
            HAVING COUNT(pr.Id) >= 3
            ORDER BY AverageRating DESC";

        var topPerformers = await _db.Database
            .SqlQueryRaw<TeamPerformerRawDto>(topPerformersSql, query.TeamId)
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
            INNER JOIN Players p ON pr.PlayerId = p.Id
            WHERE m.TeamId = {0}
                AND m.Status = 2
                AND pr.Rating IS NOT NULL
                AND p.IsArchived = 0
            GROUP BY pr.PlayerId, p.FirstName, p.LastName
            HAVING COUNT(pr.Id) >= 3 AND AVG(CAST(pr.Rating AS decimal(5,2))) < 6.0
            ORDER BY AverageRating ASC";

        var underperforming = await _db.Database
            .SqlQueryRaw<TeamPerformerRawDto>(underperformingSql, query.TeamId)
            .ToListAsync(cancellationToken);

        var trainingSessionsSql = @"
            SELECT TOP 3
                s.Id,
                s.TeamId,
                s.SessionDate,
                s.MeetTime,
                s.DurationMinutes,
                s.Location,
                s.FocusAreas
            FROM TrainingSessions s
            WHERE s.TeamId = {0}
                AND s.Status = 0
                AND s.SessionDate >= GETUTCDATE()
            ORDER BY s.SessionDate ASC";

        var trainingSessions = await _db.Database
            .SqlQueryRaw<TeamTrainingSessionRawDto>(trainingSessionsSql, query.TeamId)
            .ToListAsync(cancellationToken);

        var wins = matchStats?.Wins ?? 0;
        var draws = matchStats?.Draws ?? 0;
        var losses = matchStats?.Losses ?? 0;
        var matchesPlayed = matchStats?.MatchesPlayed ?? 0;
        var goalsFor = matchStats?.GoalsFor ?? 0;
        var goalsAgainst = matchStats?.GoalsAgainst ?? 0;

        return new TeamOverviewDto
        {
            Team = new TeamOverviewTeamDto
            {
                Id = team.Id,
                ClubId = team.ClubId,
                AgeGroupId = team.AgeGroupId,
                Name = team.Name ?? string.Empty,
                ShortName = team.ShortName ?? string.Empty,
                Level = team.Level ?? string.Empty,
                Season = team.Season ?? string.Empty,
                Colors = new TeamColorsDto
                {
                    Primary = team.PrimaryColor,
                    Secondary = team.SecondaryColor
                },
                IsArchived = team.IsArchived
            },
            Statistics = new TeamOverviewStatisticsDto
            {
                PlayerCount = playerCount?.PlayerCount ?? 0,
                MatchesPlayed = matchesPlayed,
                Wins = wins,
                Draws = draws,
                Losses = losses,
                WinRate = matchesPlayed > 0 ? Math.Round((decimal)wins / matchesPlayed * 100, 1) : 0,
                GoalDifference = goalsFor - goalsAgainst,
                UpcomingMatches = upcomingMatches.Select(m => new TeamMatchSummaryDto
                {
                    Id = m.Id,
                    TeamId = m.TeamId,
                    AgeGroupId = m.AgeGroupId,
                    Opposition = m.Opposition ?? string.Empty,
                    Date = m.MatchDate,
                    MeetTime = m.MeetTime,
                    KickOffTime = m.KickOffTime,
                    Location = m.Location ?? string.Empty,
                    IsHome = m.IsHome,
                    Competition = m.Competition,
                    Score = null
                }).ToList(),
                PreviousResults = recentResults.Select(m => new TeamMatchSummaryDto
                {
                    Id = m.Id,
                    TeamId = m.TeamId,
                    AgeGroupId = m.AgeGroupId,
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
                TopPerformers = topPerformers.Select(p => new TeamPerformerDto
                {
                    PlayerId = p.PlayerId,
                    FirstName = p.FirstName ?? string.Empty,
                    LastName = p.LastName ?? string.Empty,
                    AverageRating = p.AverageRating,
                    MatchesPlayed = p.MatchesPlayed
                }).ToList(),
                Underperforming = underperforming.Select(p => new TeamPerformerDto
                {
                    PlayerId = p.PlayerId,
                    FirstName = p.FirstName ?? string.Empty,
                    LastName = p.LastName ?? string.Empty,
                    AverageRating = p.AverageRating,
                    MatchesPlayed = p.MatchesPlayed
                }).ToList()
            },
            UpcomingTrainingSessions = trainingSessions.Select(session => new TeamTrainingSessionDto
            {
                Id = session.Id,
                TeamId = session.TeamId,
                Date = session.SessionDate,
                MeetTime = session.MeetTime,
                DurationMinutes = session.DurationMinutes,
                Location = session.Location ?? string.Empty,
                FocusAreas = string.IsNullOrWhiteSpace(session.FocusAreas)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(session.FocusAreas) ?? new List<string>()
            }).ToList()
        };
    }
}

/// <summary>
/// Raw DTO for team overview
/// </summary>
public class TeamOverviewTeamRawDto
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? Name { get; set; }
    public string? ShortName { get; set; }
    public string? Level { get; set; }
    public string? Season { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public bool IsArchived { get; set; }
}

/// <summary>
/// Raw DTO for team player count
/// </summary>
public class TeamPlayerCountRawDto
{
    public int PlayerCount { get; set; }
}

/// <summary>
/// Raw DTO for team match stats
/// </summary>
public class TeamMatchStatsRawDto
{
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
    public int GoalsFor { get; set; }
    public int GoalsAgainst { get; set; }
}

/// <summary>
/// Raw DTO for team match summaries
/// </summary>
public class TeamMatchRawDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
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
/// Raw DTO for performer data
/// </summary>
public class TeamPerformerRawDto
{
    public Guid PlayerId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public decimal AverageRating { get; set; }
    public int MatchesPlayed { get; set; }
}

/// <summary>
/// Raw DTO for training session summary
/// </summary>
public class TeamTrainingSessionRawDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public DateTime SessionDate { get; set; }
    public DateTime? MeetTime { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Location { get; set; }
    public string? FocusAreas { get; set; }
}