using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Queries.GetMatchById;

/// <summary>
/// Query to get a match by ID with all related data
/// </summary>
public record GetMatchByIdQuery(Guid MatchId) : IQuery<MatchDetailDto?>;

/// <summary>
/// Handler for GetMatchByIdQuery - retrieves full match detail using raw SQL
/// </summary>
public class GetMatchByIdHandler : IRequestHandler<GetMatchByIdQuery, MatchDetailDto?>
{
    private readonly OurGameContext _db;

    public GetMatchByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<MatchDetailDto?> Handle(GetMatchByIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Fetch the match with team/age-group context
        var matchSql = @"
            SELECT 
                m.Id,
                m.TeamId,
                t.AgeGroupId,
                t.Name AS TeamName,
                ag.Name AS AgeGroupName,
                m.SeasonId,
                m.SquadSize,
                m.Opposition,
                m.MatchDate,
                m.MeetTime,
                m.KickOffTime,
                m.Location,
                m.IsHome,
                m.Competition,
                m.PrimaryKitId,
                m.SecondaryKitId,
                m.GoalkeeperKitId,
                m.HomeScore,
                m.AwayScore,
                m.Status,
                m.IsLocked,
                m.Notes,
                m.WeatherCondition,
                m.WeatherTemperature,
                m.CreatedAt,
                m.UpdatedAt
            FROM Matches m
            INNER JOIN Teams t ON m.TeamId = t.Id
            INNER JOIN AgeGroups ag ON t.AgeGroupId = ag.Id
            WHERE m.Id = {0}";

        var match = await _db.Database
            .SqlQueryRaw<MatchRaw>(matchSql, query.MatchId)
            .FirstOrDefaultAsync(cancellationToken);

        if (match == null)
        {
            return null;
        }

        // 2. Fetch lineup with formation/tactic names
        var lineupSql = @"
            SELECT 
                ml.Id,
                ml.FormationId,
                f.Name AS FormationName,
                ml.TacticId,
                tc.Name AS TacticName
            FROM MatchLineups ml
            LEFT JOIN Formations f ON ml.FormationId = f.Id
            LEFT JOIN Formations tc ON ml.TacticId = tc.Id
            WHERE ml.MatchId = {0}";

        var lineup = await _db.Database
            .SqlQueryRaw<LineupRaw>(lineupSql, query.MatchId)
            .FirstOrDefaultAsync(cancellationToken);

        // 3. Fetch lineup players (only if lineup exists)
        var lineupPlayers = new List<LineupPlayerRaw>();
        if (lineup != null)
        {
            var lineupPlayersSql = @"
                SELECT 
                    lp.Id,
                    lp.PlayerId,
                    p.FirstName,
                    p.LastName,
                    lp.Position,
                    lp.SquadNumber,
                    lp.IsStarting
                FROM LineupPlayers lp
                INNER JOIN Players p ON lp.PlayerId = p.Id
                WHERE lp.LineupId = {0}
                ORDER BY lp.IsStarting DESC, lp.SquadNumber";

            lineupPlayers = await _db.Database
                .SqlQueryRaw<LineupPlayerRaw>(lineupPlayersSql, lineup.Id)
                .ToListAsync(cancellationToken);
        }

        // 4. Fetch match coaches
        var coachesSql = @"
            SELECT 
                mc.Id,
                mc.CoachId,
                c.FirstName,
                c.LastName
            FROM MatchCoaches mc
            INNER JOIN Coaches c ON mc.CoachId = c.Id
            WHERE mc.MatchId = {0}";

        var coaches = await _db.Database
            .SqlQueryRaw<MatchCoachRaw>(coachesSql, query.MatchId)
            .ToListAsync(cancellationToken);

        // 5. Fetch substitutions
        var subsSql = @"
            SELECT 
                ms.Id,
                ms.Minute,
                ms.PlayerOutId,
                pOut.FirstName + ' ' + pOut.LastName AS PlayerOutName,
                ms.PlayerInId,
                pIn.FirstName + ' ' + pIn.LastName AS PlayerInName
            FROM MatchSubstitutions ms
            INNER JOIN Players pOut ON ms.PlayerOutId = pOut.Id
            INNER JOIN Players pIn ON ms.PlayerInId = pIn.Id
            WHERE ms.MatchId = {0}
            ORDER BY ms.Minute";

        var substitutions = await _db.Database
            .SqlQueryRaw<SubstitutionRaw>(subsSql, query.MatchId)
            .ToListAsync(cancellationToken);

        // 6. Fetch match report
        var reportSql = @"
            SELECT 
                mr.Id,
                mr.Summary,
                mr.CaptainId,
                capP.FirstName + ' ' + capP.LastName AS CaptainName,
                mr.PlayerOfMatchId,
                pomP.FirstName + ' ' + pomP.LastName AS PlayerOfMatchName
            FROM MatchReports mr
            LEFT JOIN Players capP ON mr.CaptainId = capP.Id
            LEFT JOIN Players pomP ON mr.PlayerOfMatchId = pomP.Id
            WHERE mr.MatchId = {0}";

        var report = await _db.Database
            .SqlQueryRaw<ReportRaw>(reportSql, query.MatchId)
            .FirstOrDefaultAsync(cancellationToken);

        // 7. Fetch report child data (goals, cards, injuries, ratings) if report exists
        var goals = new List<GoalRaw>();
        var cards = new List<CardRaw>();
        var injuries = new List<InjuryRaw>();
        var ratings = new List<RatingRaw>();

        if (report != null)
        {
            var goalsSql = @"
                SELECT 
                    g.Id,
                    g.PlayerId,
                    p.FirstName + ' ' + p.LastName AS ScorerName,
                    g.Minute,
                    g.AssistPlayerId,
                    ap.FirstName + ' ' + ap.LastName AS AssistPlayerName
                FROM Goals g
                INNER JOIN Players p ON g.PlayerId = p.Id
                LEFT JOIN Players ap ON g.AssistPlayerId = ap.Id
                WHERE g.MatchReportId = {0}
                ORDER BY g.Minute";

            goals = await _db.Database
                .SqlQueryRaw<GoalRaw>(goalsSql, report.Id)
                .ToListAsync(cancellationToken);

            var cardsSql = @"
                SELECT 
                    c.Id,
                    c.PlayerId,
                    p.FirstName + ' ' + p.LastName AS PlayerName,
                    c.Type,
                    c.Minute,
                    c.Reason
                FROM Cards c
                INNER JOIN Players p ON c.PlayerId = p.Id
                WHERE c.MatchReportId = {0}
                ORDER BY c.Minute";

            cards = await _db.Database
                .SqlQueryRaw<CardRaw>(cardsSql, report.Id)
                .ToListAsync(cancellationToken);

            var injuriesSql = @"
                SELECT 
                    i.Id,
                    i.PlayerId,
                    p.FirstName + ' ' + p.LastName AS PlayerName,
                    i.Minute,
                    i.Description,
                    i.Severity
                FROM Injuries i
                INNER JOIN Players p ON i.PlayerId = p.Id
                WHERE i.MatchReportId = {0}
                ORDER BY i.Minute";

            injuries = await _db.Database
                .SqlQueryRaw<InjuryRaw>(injuriesSql, report.Id)
                .ToListAsync(cancellationToken);

            var ratingsSql = @"
                SELECT 
                    pr.Id,
                    pr.PlayerId,
                    p.FirstName + ' ' + p.LastName AS PlayerName,
                    pr.Rating
                FROM PerformanceRatings pr
                INNER JOIN Players p ON pr.PlayerId = p.Id
                WHERE pr.MatchReportId = {0}
                ORDER BY pr.Rating DESC";

            ratings = await _db.Database
                .SqlQueryRaw<RatingRaw>(ratingsSql, report.Id)
                .ToListAsync(cancellationToken);
        }

        // Map everything to the response DTO
        return new MatchDetailDto
        {
            Id = match.Id,
            TeamId = match.TeamId,
            AgeGroupId = match.AgeGroupId,
            TeamName = match.TeamName ?? string.Empty,
            AgeGroupName = match.AgeGroupName ?? string.Empty,
            SeasonId = match.SeasonId ?? string.Empty,
            SquadSize = match.SquadSize,
            Opposition = match.Opposition ?? string.Empty,
            MatchDate = match.MatchDate,
            MeetTime = match.MeetTime,
            KickOffTime = match.KickOffTime,
            Location = match.Location ?? string.Empty,
            IsHome = match.IsHome,
            Competition = match.Competition ?? string.Empty,
            PrimaryKitId = match.PrimaryKitId,
            SecondaryKitId = match.SecondaryKitId,
            GoalkeeperKitId = match.GoalkeeperKitId,
            HomeScore = match.HomeScore,
            AwayScore = match.AwayScore,
            Status = MapStatusToString(match.Status),
            IsLocked = match.IsLocked,
            Notes = match.Notes,
            WeatherCondition = match.WeatherCondition,
            WeatherTemperature = match.WeatherTemperature,
            CreatedAt = match.CreatedAt,
            UpdatedAt = match.UpdatedAt,
            Lineup = lineup == null ? null : new MatchLineupDto
            {
                Id = lineup.Id,
                FormationId = lineup.FormationId,
                FormationName = lineup.FormationName,
                TacticId = lineup.TacticId,
                TacticName = lineup.TacticName,
                Players = lineupPlayers.Select(lp => new LineupPlayerDto
                {
                    Id = lp.Id,
                    PlayerId = lp.PlayerId,
                    FirstName = lp.FirstName ?? string.Empty,
                    LastName = lp.LastName ?? string.Empty,
                    Position = lp.Position,
                    SquadNumber = lp.SquadNumber,
                    IsStarting = lp.IsStarting
                }).ToList()
            },
            Report = report == null ? null : new MatchReportDetailDto
            {
                Id = report.Id,
                Summary = report.Summary,
                CaptainId = report.CaptainId,
                CaptainName = report.CaptainName,
                PlayerOfMatchId = report.PlayerOfMatchId,
                PlayerOfMatchName = report.PlayerOfMatchName,
                Goals = goals.Select(g => new GoalDetailDto
                {
                    Id = g.Id,
                    PlayerId = g.PlayerId,
                    ScorerName = g.ScorerName ?? string.Empty,
                    Minute = g.Minute,
                    AssistPlayerId = g.AssistPlayerId,
                    AssistPlayerName = g.AssistPlayerName
                }).ToList(),
                Cards = cards.Select(c => new CardDetailDto
                {
                    Id = c.Id,
                    PlayerId = c.PlayerId,
                    PlayerName = c.PlayerName ?? string.Empty,
                    Type = MapCardTypeToString(c.Type),
                    Minute = c.Minute,
                    Reason = c.Reason
                }).ToList(),
                Injuries = injuries.Select(i => new InjuryDetailDto
                {
                    Id = i.Id,
                    PlayerId = i.PlayerId,
                    PlayerName = i.PlayerName ?? string.Empty,
                    Minute = i.Minute,
                    Description = i.Description,
                    Severity = MapSeverityToString(i.Severity)
                }).ToList(),
                PerformanceRatings = ratings.Select(r => new PerformanceRatingDto
                {
                    Id = r.Id,
                    PlayerId = r.PlayerId,
                    PlayerName = r.PlayerName ?? string.Empty,
                    Rating = r.Rating
                }).ToList()
            },
            Coaches = coaches.Select(c => new MatchCoachDetailDto
            {
                Id = c.Id,
                CoachId = c.CoachId,
                FirstName = c.FirstName ?? string.Empty,
                LastName = c.LastName ?? string.Empty
            }).ToList(),
            Substitutions = substitutions.Select(s => new MatchSubstitutionDetailDto
            {
                Id = s.Id,
                Minute = s.Minute,
                PlayerOutId = s.PlayerOutId,
                PlayerOutName = s.PlayerOutName ?? string.Empty,
                PlayerInId = s.PlayerInId,
                PlayerInName = s.PlayerInName ?? string.Empty
            }).ToList()
        };
    }

    private static string MapStatusToString(int status)
    {
        return status switch
        {
            0 => "scheduled",
            1 => "in-progress",
            2 => "completed",
            3 => "postponed",
            4 => "cancelled",
            _ => "scheduled"
        };
    }

    private static string MapCardTypeToString(int type)
    {
        return type switch
        {
            0 => "yellow",
            1 => "red",
            _ => "yellow"
        };
    }

    private static string MapSeverityToString(int severity)
    {
        return severity switch
        {
            0 => "minor",
            1 => "moderate",
            2 => "serious",
            _ => "minor"
        };
    }
}

#region Raw SQL DTOs

public class MatchRaw
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string? TeamName { get; set; }
    public string? AgeGroupName { get; set; }
    public string? SeasonId { get; set; }
    public int SquadSize { get; set; }
    public string? Opposition { get; set; }
    public DateTime MatchDate { get; set; }
    public DateTime? MeetTime { get; set; }
    public DateTime? KickOffTime { get; set; }
    public string? Location { get; set; }
    public bool IsHome { get; set; }
    public string? Competition { get; set; }
    public Guid? PrimaryKitId { get; set; }
    public Guid? SecondaryKitId { get; set; }
    public Guid? GoalkeeperKitId { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public int Status { get; set; }
    public bool IsLocked { get; set; }
    public string? Notes { get; set; }
    public string? WeatherCondition { get; set; }
    public int? WeatherTemperature { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class LineupRaw
{
    public Guid Id { get; set; }
    public Guid? FormationId { get; set; }
    public string? FormationName { get; set; }
    public Guid? TacticId { get; set; }
    public string? TacticName { get; set; }
}

public class LineupPlayerRaw
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Position { get; set; }
    public int? SquadNumber { get; set; }
    public bool IsStarting { get; set; }
}

public class MatchCoachRaw
{
    public Guid Id { get; set; }
    public Guid CoachId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class SubstitutionRaw
{
    public Guid Id { get; set; }
    public int Minute { get; set; }
    public Guid PlayerOutId { get; set; }
    public string? PlayerOutName { get; set; }
    public Guid PlayerInId { get; set; }
    public string? PlayerInName { get; set; }
}

public class ReportRaw
{
    public Guid Id { get; set; }
    public string? Summary { get; set; }
    public Guid? CaptainId { get; set; }
    public string? CaptainName { get; set; }
    public Guid? PlayerOfMatchId { get; set; }
    public string? PlayerOfMatchName { get; set; }
}

public class GoalRaw
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string? ScorerName { get; set; }
    public int Minute { get; set; }
    public Guid? AssistPlayerId { get; set; }
    public string? AssistPlayerName { get; set; }
}

public class CardRaw
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string? PlayerName { get; set; }
    public int Type { get; set; }
    public int Minute { get; set; }
    public string? Reason { get; set; }
}

public class InjuryRaw
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string? PlayerName { get; set; }
    public int Minute { get; set; }
    public string? Description { get; set; }
    public int Severity { get; set; }
}

public class RatingRaw
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string? PlayerName { get; set; }
    public decimal? Rating { get; set; }
}

#endregion
