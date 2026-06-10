using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerRecentPerformances.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayerRecentPerformances;

/// <summary>
/// Query to get player's recent match performances
/// </summary>
public record GetPlayerRecentPerformancesQuery(Guid PlayerId, string? UserId = null, int Limit = 10) : IQuery<List<PlayerRecentPerformanceDto>>;

/// <summary>
/// Handler for GetPlayerRecentPerformancesQuery.
/// Returns recent match performances for a player based on lineup appearances.
/// </summary>
public class GetPlayerRecentPerformancesHandler : IRequestHandler<GetPlayerRecentPerformancesQuery, List<PlayerRecentPerformanceDto>>
{
    private readonly OurGameContext _db;

    public GetPlayerRecentPerformancesHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<PlayerRecentPerformanceDto>> Handle(GetPlayerRecentPerformancesQuery query, CancellationToken cancellationToken)
    {
        // Base appearances from lineup, with optional rating/goals/assists via LEFT JOINs
        var sql = @"
            WITH Appearances AS (
                SELECT DISTINCT
                    m.Id AS MatchId,
                    m.TeamId,
                    t.AgeGroupId,
                    m.MatchDate,
                    COALESCE(m.SeasonId,
                        CASE WHEN MONTH(m.MatchDate) >= 8
                             THEN CAST(YEAR(m.MatchDate) AS NVARCHAR(4)) + N'/' + RIGHT(N'0' + CAST((YEAR(m.MatchDate)+1)%100 AS NVARCHAR(2)), 2)
                             ELSE CAST(YEAR(m.MatchDate)-1 AS NVARCHAR(4)) + N'/' + RIGHT(N'0' + CAST(YEAR(m.MatchDate)%100 AS NVARCHAR(2)), 2)
                        END) AS Season,
                    m.Opposition AS Opponent,
                    CASE WHEN m.IsHome = 1 THEN N'Home' ELSE N'Away' END AS HomeAway,
                    m.Competition,
                    m.HomeScore,
                    m.AwayScore,
                    m.IsHome
                FROM LineupPlayers lp
                INNER JOIN MatchLineups ml ON lp.LineupId = ml.Id
                INNER JOIN Matches m ON ml.MatchId = m.Id
                INNER JOIN Teams t ON m.TeamId = t.Id
                WHERE lp.PlayerId = {0} AND m.Status = 2
            ),
            GoalCounts AS (
                SELECT mr.MatchId, COUNT(*) AS Goals
                FROM Goals g
                INNER JOIN MatchReports mr ON g.MatchReportId = mr.Id
                WHERE g.PlayerId = {0}
                GROUP BY mr.MatchId
            ),
            AssistCounts AS (
                SELECT mr.MatchId, COUNT(*) AS Assists
                FROM Goals g
                INNER JOIN MatchReports mr ON g.MatchReportId = mr.Id
                WHERE g.AssistPlayerId = {0}
                GROUP BY mr.MatchId
            ),
            Aggregated AS (
                SELECT
                    a.MatchId, a.TeamId, a.AgeGroupId, a.MatchDate, a.Season,
                    a.Opponent, a.HomeAway, a.Competition, a.HomeScore, a.AwayScore, a.IsHome,
                    MAX(pr.Rating) AS Rating,
                    ISNULL(MAX(gc.Goals), 0) AS Goals,
                    ISNULL(MAX(ac.Assists), 0) AS Assists
                FROM Appearances a
                LEFT JOIN MatchReports mr ON mr.MatchId = a.MatchId
                LEFT JOIN PerformanceRatings pr ON pr.MatchReportId = mr.Id AND pr.PlayerId = {0}
                LEFT JOIN GoalCounts gc ON gc.MatchId = a.MatchId
                LEFT JOIN AssistCounts ac ON ac.MatchId = a.MatchId
                GROUP BY a.MatchId, a.TeamId, a.AgeGroupId, a.MatchDate, a.Season,
                         a.Opponent, a.HomeAway, a.Competition, a.HomeScore, a.AwayScore, a.IsHome
            )
            SELECT TOP({1}) * FROM Aggregated ORDER BY MatchDate DESC";

        var rawResults = await _db.Database
            .SqlQueryRaw<PerformanceRawResult>(sql, query.PlayerId, query.Limit)
            .ToListAsync(cancellationToken);

        return rawResults.Select(r => new PlayerRecentPerformanceDto
        {
            MatchId = r.MatchId,
            TeamId = r.TeamId,
            AgeGroupId = r.AgeGroupId,
            MatchDate = r.MatchDate,
            Season = r.Season ?? string.Empty,
            Opponent = r.Opponent ?? string.Empty,
            HomeAway = r.HomeAway ?? "Home",
            Result = CalculateResult(r.IsHome, r.HomeScore, r.AwayScore),
            Rating = r.Rating,
            Goals = r.Goals,
            Assists = r.Assists,
            Competition = r.Competition
        }).ToList();
    }

    private static string CalculateResult(bool isHome, int? homeScore, int? awayScore)
    {
        if (homeScore == null || awayScore == null)
            return "N/A";

        int ourScore = isHome ? homeScore.Value : awayScore.Value;
        int theirScore = isHome ? awayScore.Value : homeScore.Value;

        string resultLetter = ourScore > theirScore ? "W" :
                              ourScore < theirScore ? "L" : "D";

        return $"{resultLetter} {ourScore}-{theirScore}";
    }
}

/// <summary>
/// Raw SQL result for performance data
/// </summary>
public class PerformanceRawResult
{
    public Guid MatchId { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
    public DateTime MatchDate { get; set; }
    public string? Season { get; set; }
    public string? Opponent { get; set; }
    public string? HomeAway { get; set; }
    public string? Competition { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public bool IsHome { get; set; }
    public decimal? Rating { get; set; }
    public int Goals { get; set; }
    public int Assists { get; set; }
}
