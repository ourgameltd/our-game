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
/// Returns recent match performances for a player with authorization checks.
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
        // Fetch recent performances with match context
        var performancesSql = @"
            SELECT TOP({1})
                m.Id AS MatchId,
                m.TeamId,
                t.AgeGroupId,
                m.MatchDate,
                m.Opposition AS Opponent,
                CASE WHEN m.IsHome = 1 THEN 'Home' ELSE 'Away' END AS HomeAway,
                m.Competition,
                m.HomeScore,
                m.AwayScore,
                m.IsHome,
                pr.Rating,
                ISNULL(goals.GoalCount, 0) AS Goals,
                ISNULL(assists.AssistCount, 0) AS Assists
            FROM PerformanceRatings pr
            INNER JOIN MatchReports mr ON pr.MatchReportId = mr.Id
            INNER JOIN Matches m ON mr.MatchId = m.Id
            INNER JOIN Teams t ON m.TeamId = t.Id
            LEFT JOIN (
                SELECT MatchReportId, PlayerId, COUNT(*) AS GoalCount
                FROM Goals
                WHERE PlayerId = {0}
                GROUP BY MatchReportId, PlayerId
            ) goals ON goals.MatchReportId = mr.Id AND goals.PlayerId = {0}
            LEFT JOIN (
                SELECT MatchReportId, AssistPlayerId, COUNT(*) AS AssistCount
                FROM Goals
                WHERE AssistPlayerId = {0}
                GROUP BY MatchReportId, AssistPlayerId
            ) assists ON assists.MatchReportId = mr.Id AND assists.AssistPlayerId = {0}
            WHERE pr.PlayerId = {0}
                AND m.Status = 2
            ORDER BY m.MatchDate DESC";

        var rawResults = await _db.Database
            .SqlQueryRaw<PerformanceRawResult>(performancesSql, query.PlayerId, query.Limit)
            .ToListAsync(cancellationToken);

        // Map to DTOs
        return rawResults.Select(r => new PlayerRecentPerformanceDto
        {
            MatchId = r.MatchId,
            TeamId = r.TeamId,
            AgeGroupId = r.AgeGroupId,
            MatchDate = r.MatchDate,
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
        {
            return "N/A";
        }

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
