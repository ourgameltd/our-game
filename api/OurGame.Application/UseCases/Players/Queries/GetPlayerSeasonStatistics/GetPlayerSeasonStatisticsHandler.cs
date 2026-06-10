using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerSeasonStatistics.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayerSeasonStatistics;

public record GetPlayerSeasonStatisticsQuery(Guid PlayerId) : IQuery<List<PlayerSeasonStatisticsDto>>;

public class GetPlayerSeasonStatisticsHandler : IRequestHandler<GetPlayerSeasonStatisticsQuery, List<PlayerSeasonStatisticsDto>>
{
    private readonly OurGameContext _db;

    public GetPlayerSeasonStatisticsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<PlayerSeasonStatisticsDto>> Handle(GetPlayerSeasonStatisticsQuery query, CancellationToken cancellationToken)
    {
        var matchStatsSql = @"
            WITH Appearances AS (
                SELECT DISTINCT
                    m.Id AS MatchId,
                    COALESCE(m.SeasonId,
                        CASE WHEN MONTH(m.MatchDate) >= 8
                             THEN CAST(YEAR(m.MatchDate) AS NVARCHAR(4)) + N'/' + RIGHT(N'0' + CAST((YEAR(m.MatchDate)+1)%100 AS NVARCHAR(2)), 2)
                             ELSE CAST(YEAR(m.MatchDate)-1 AS NVARCHAR(4)) + N'/' + RIGHT(N'0' + CAST(YEAR(m.MatchDate)%100 AS NVARCHAR(2)), 2)
                        END) AS Season
                FROM LineupPlayers lp
                INNER JOIN MatchLineups ml ON lp.LineupId = ml.Id
                INNER JOIN Matches m ON ml.MatchId = m.Id
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
            RatingsByMatch AS (
                SELECT mr.MatchId, AVG(CAST(pr.Rating AS FLOAT)) AS AvgRating
                FROM PerformanceRatings pr
                INNER JOIN MatchReports mr ON pr.MatchReportId = mr.Id
                WHERE pr.PlayerId = {0}
                GROUP BY mr.MatchId
            )
            SELECT
                a.Season,
                COUNT(*) AS Appearances,
                ISNULL(SUM(gc.Goals), 0) AS Goals,
                ISNULL(SUM(ac.Assists), 0) AS Assists,
                AVG(rm.AvgRating) AS AvgRating
            FROM Appearances a
            LEFT JOIN GoalCounts gc ON gc.MatchId = a.MatchId
            LEFT JOIN AssistCounts ac ON ac.MatchId = a.MatchId
            LEFT JOIN RatingsByMatch rm ON rm.MatchId = a.MatchId
            GROUP BY a.Season
            ORDER BY a.Season DESC";

        var matchAttendanceSql = @"
            WITH Seasoned AS (
                SELECT
                    ma.Status,
                    COALESCE(m.SeasonId,
                        CASE WHEN MONTH(m.MatchDate) >= 8
                             THEN CAST(YEAR(m.MatchDate) AS NVARCHAR(4)) + N'/' + RIGHT(N'0' + CAST((YEAR(m.MatchDate)+1)%100 AS NVARCHAR(2)), 2)
                             ELSE CAST(YEAR(m.MatchDate)-1 AS NVARCHAR(4)) + N'/' + RIGHT(N'0' + CAST(YEAR(m.MatchDate)%100 AS NVARCHAR(2)), 2)
                        END) AS Season
                FROM MatchAttendances ma
                INNER JOIN Matches m ON ma.MatchId = m.Id
                WHERE ma.PlayerId = {0}
            )
            SELECT
                Season,
                SUM(CASE WHEN Status = N'confirmed' THEN 1 ELSE 0 END) AS Confirmed,
                SUM(CASE WHEN Status = N'declined'  THEN 1 ELSE 0 END) AS Declined,
                SUM(CASE WHEN Status = N'pending' OR Status IS NULL THEN 1 ELSE 0 END) AS Pending,
                COUNT(*) AS Total
            FROM Seasoned
            GROUP BY Season";

        var trainingAttendanceSql = @"
            WITH Seasoned AS (
                SELECT
                    sa.Present,
                    CASE WHEN MONTH(ts.SessionDate) >= 8
                         THEN CAST(YEAR(ts.SessionDate) AS NVARCHAR(4)) + N'/' + RIGHT(N'0' + CAST((YEAR(ts.SessionDate)+1)%100 AS NVARCHAR(2)), 2)
                         ELSE CAST(YEAR(ts.SessionDate)-1 AS NVARCHAR(4)) + N'/' + RIGHT(N'0' + CAST(YEAR(ts.SessionDate)%100 AS NVARCHAR(2)), 2)
                    END AS Season
                FROM SessionAttendances sa
                INNER JOIN TrainingSessions ts ON sa.SessionId = ts.Id
                WHERE sa.PlayerId = {0} AND ts.SessionDate <= GETUTCDATE()
            )
            SELECT
                Season,
                SUM(CASE WHEN Present = 1 THEN 1 ELSE 0 END) AS Present,
                SUM(CASE WHEN Present = 0 THEN 1 ELSE 0 END) AS Absent,
                COUNT(*) AS Total
            FROM Seasoned
            GROUP BY Season";

        // Queries must be sequential — EF Core does not support concurrent operations on a single DbContext
        var matchStats = await _db.Database
            .SqlQueryRaw<MatchSeasonRaw>(matchStatsSql, query.PlayerId)
            .ToListAsync(cancellationToken);

        var matchAttendance = (await _db.Database
            .SqlQueryRaw<MatchAttendanceSeasonRaw>(matchAttendanceSql, query.PlayerId)
            .ToListAsync(cancellationToken))
            .ToDictionary(x => x.Season);

        var trainingAttendance = (await _db.Database
            .SqlQueryRaw<TrainingAttendanceSeasonRaw>(trainingAttendanceSql, query.PlayerId)
            .ToListAsync(cancellationToken))
            .ToDictionary(x => x.Season);

        // Collect all seasons from any source
        var allSeasons = matchStats.Select(x => x.Season)
            .Union(matchAttendance.Keys)
            .Union(trainingAttendance.Keys)
            .Distinct()
            .OrderByDescending(s => s)
            .ToList();

        var matchStatsByseason = matchStats.ToDictionary(x => x.Season);

        return allSeasons.Select(season =>
        {
            matchStatsByseason.TryGetValue(season, out var ms);
            matchAttendance.TryGetValue(season, out var ma);
            trainingAttendance.TryGetValue(season, out var ta);

            return new PlayerSeasonStatisticsDto
            {
                Season = season,
                Appearances = ms?.Appearances ?? 0,
                Goals = ms?.Goals ?? 0,
                Assists = ms?.Assists ?? 0,
                AvgRating = ms?.AvgRating.HasValue == true ? (decimal?)ms.AvgRating.Value : null,
                MatchesConfirmed = ma?.Confirmed ?? 0,
                MatchesDeclined = ma?.Declined ?? 0,
                MatchesPending = ma?.Pending ?? 0,
                MatchesRsvpd = ma?.Total ?? 0,
                TrainingPresent = ta?.Present ?? 0,
                TrainingAbsent = ta?.Absent ?? 0,
                TrainingTotal = ta?.Total ?? 0,
            };
        }).ToList();
    }
}

public class MatchSeasonRaw
{
    public string Season { get; set; } = string.Empty;
    public int Appearances { get; set; }
    public int Goals { get; set; }
    public int Assists { get; set; }
    public double? AvgRating { get; set; }
}

public class MatchAttendanceSeasonRaw
{
    public string Season { get; set; } = string.Empty;
    public int Confirmed { get; set; }
    public int Declined { get; set; }
    public int Pending { get; set; }
    public int Total { get; set; }
}

public class TrainingAttendanceSeasonRaw
{
    public string Season { get; set; } = string.Empty;
    public int Present { get; set; }
    public int Absent { get; set; }
    public int Total { get; set; }
}
