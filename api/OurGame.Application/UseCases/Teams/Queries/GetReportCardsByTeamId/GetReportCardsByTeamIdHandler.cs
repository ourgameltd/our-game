using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Clubs.Queries.GetReportCardsByClubId.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Teams.Queries.GetReportCardsByTeamId;

/// <summary>
/// Query to get all report cards for players in a specific team
/// </summary>
public record GetReportCardsByTeamIdQuery(Guid TeamId) : IQuery<List<ClubReportCardDto>>;

/// <summary>
/// Handler for GetReportCardsByTeamIdQuery
/// </summary>
public class GetReportCardsByTeamIdHandler : IRequestHandler<GetReportCardsByTeamIdQuery, List<ClubReportCardDto>>
{
    private readonly OurGameContext _db;

    public GetReportCardsByTeamIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<ClubReportCardDto>> Handle(GetReportCardsByTeamIdQuery query, CancellationToken cancellationToken)
    {
        // Get all report cards for players belonging to this team
        var sql = @"
            SELECT 
                pr.Id,
                pr.PlayerId,
                pr.PeriodStart,
                pr.PeriodEnd,
                pr.OverallRating,
                pr.Strengths,
                pr.AreasForImprovement,
                pr.CoachComments,
                pr.CreatedBy,
                pr.CreatedAt,
                p.FirstName AS PlayerFirstName,
                p.LastName AS PlayerLastName,
                p.Nickname AS PlayerNickname,
                p.Photo AS PlayerPhoto,
                p.PreferredPositions AS PlayerPreferredPositions
            FROM PlayerReports pr
            INNER JOIN Players p ON pr.PlayerId = p.Id
            INNER JOIN PlayerTeams pt ON p.Id = pt.PlayerId
            WHERE pt.TeamId = {0}
            ORDER BY pr.CreatedAt DESC";

        var reportData = await _db.Database
            .SqlQueryRaw<ReportCardRawDto>(sql, query.TeamId)
            .ToListAsync(cancellationToken);

        if (reportData.Count == 0)
        {
            return new List<ClubReportCardDto>();
        }

        // Get report IDs for fetching related data
        var reportIds = reportData.Select(r => r.Id).ToList();

        // Build parameterized query for development actions
        var parameters = reportIds.Select((id, index) =>
            new Microsoft.Data.SqlClient.SqlParameter($"@p{index}", id)).ToArray();
        var parameterNames = string.Join(", ", parameters.Select(p => p.ParameterName));

        // Get development actions for reports
        var devActionsSql = $@"
            SELECT 
                rda.Id,
                rda.ReportId,
                rda.Goal,
                rda.Actions,
                rda.StartDate,
                rda.TargetDate,
                rda.Completed,
                rda.CompletedDate
            FROM ReportDevelopmentActions rda
            WHERE rda.ReportId IN ({parameterNames})
            ORDER BY rda.StartDate";

        var devActionsData = await _db.Database
            .SqlQueryRaw<DevelopmentActionRawDto>(devActionsSql, parameters)
            .ToListAsync(cancellationToken);

        // Get similar professionals for reports
        var similarProfsSql = $@"
            SELECT 
                sp.ReportId,
                sp.Name,
                sp.Team,
                sp.Position,
                sp.Reason
            FROM SimilarProfessionals sp
            WHERE sp.ReportId IN ({parameterNames})";

        var similarProfsData = await _db.Database
            .SqlQueryRaw<SimilarProfessionalRawDto>(similarProfsSql, parameters)
            .ToListAsync(cancellationToken);

        // Get player IDs for fetching age groups
        var playerIds = reportData.Select(r => r.PlayerId).Distinct().ToList();
        var playerParams = playerIds.Select((id, index) =>
            new Microsoft.Data.SqlClient.SqlParameter($"@player{index}", id)).ToArray();
        var playerParamNames = string.Join(", ", playerParams.Select(p => p.ParameterName));

        // Get age groups for players
        var ageGroupsSql = $@"
            SELECT 
                pag.PlayerId,
                pag.AgeGroupId
            FROM PlayerAgeGroups pag
            WHERE pag.PlayerId IN ({playerParamNames})";

        var ageGroupsData = await _db.Database
            .SqlQueryRaw<PlayerAgeGroupRawDto>(ageGroupsSql, playerParams)
            .ToListAsync(cancellationToken);

        // Group data by report/player for mapping
        var devActionsByReport = devActionsData.GroupBy(a => a.ReportId).ToDictionary(g => g.Key, g => g.ToList());
        var similarProfsByReport = similarProfsData.GroupBy(s => s.ReportId).ToDictionary(g => g.Key, g => g.ToList());
        var ageGroupsByPlayer = ageGroupsData.GroupBy(ag => ag.PlayerId).ToDictionary(g => g.Key, g => g.Select(x => x.AgeGroupId).ToList());

        // Map to DTOs
        return reportData.Select(r => new ClubReportCardDto
        {
            Id = r.Id,
            PlayerId = r.PlayerId,
            Player = new ClubReportCardPlayerDto
            {
                Id = r.PlayerId,
                FirstName = r.PlayerFirstName ?? string.Empty,
                LastName = r.PlayerLastName ?? string.Empty,
                Nickname = r.PlayerNickname,
                Photo = r.PlayerPhoto,
                PreferredPositions = ParseJsonArray(r.PlayerPreferredPositions),
                AgeGroupIds = ageGroupsByPlayer.TryGetValue(r.PlayerId, out var ageGroups) ? ageGroups : new List<Guid>()
            },
            Period = new ClubReportCardPeriodDto
            {
                Start = r.PeriodStart,
                End = r.PeriodEnd
            },
            OverallRating = r.OverallRating ?? 0,
            Strengths = ParseJsonArray(r.Strengths),
            AreasForImprovement = ParseJsonArray(r.AreasForImprovement),
            DevelopmentActions = devActionsByReport.TryGetValue(r.Id, out var actions)
                ? actions.Select(a => new ClubReportCardDevelopmentActionDto
                {
                    Id = a.Id,
                    Goal = a.Goal ?? string.Empty,
                    Actions = ParseJsonArray(a.Actions),
                    StartDate = a.StartDate,
                    TargetDate = a.TargetDate,
                    Completed = a.Completed,
                    CompletedDate = a.CompletedDate
                }).ToList()
                : new List<ClubReportCardDevelopmentActionDto>(),
            CoachComments = r.CoachComments ?? string.Empty,
            CreatedBy = r.CreatedBy,
            CreatedAt = r.CreatedAt,
            SimilarProfessionalPlayers = similarProfsByReport.TryGetValue(r.Id, out var profs)
                ? profs.Select(p => new ClubReportCardSimilarProfessionalDto
                {
                    Name = p.Name ?? string.Empty,
                    Team = p.Team ?? string.Empty,
                    Position = p.Position ?? string.Empty,
                    Reason = p.Reason ?? string.Empty
                }).ToList()
                : new List<ClubReportCardSimilarProfessionalDto>()
        }).ToList();
    }

    /// <summary>
    /// Parse JSON array string to list of strings
    /// </summary>
    private static List<string> ParseJsonArray(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<string>();
        }

        if (json.TrimStart().StartsWith("["))
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(json);
                return parsed ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        // If not JSON, split by delimiter
        return json.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .Where(s => !string.IsNullOrEmpty(s))
            .ToList();
    }
}

/// <summary>
/// Raw DTO for report card query result
/// </summary>
internal class ReportCardRawDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public DateOnly? PeriodStart { get; set; }
    public DateOnly? PeriodEnd { get; set; }
    public decimal? OverallRating { get; set; }
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public string? CoachComments { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? PlayerFirstName { get; set; }
    public string? PlayerLastName { get; set; }
    public string? PlayerNickname { get; set; }
    public string? PlayerPhoto { get; set; }
    public string? PlayerPreferredPositions { get; set; }
}

/// <summary>
/// Raw DTO for development action query result
/// </summary>
internal class DevelopmentActionRawDto
{
    public Guid Id { get; set; }
    public Guid ReportId { get; set; }
    public string? Goal { get; set; }
    public string? Actions { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? TargetDate { get; set; }
    public bool Completed { get; set; }
    public DateOnly? CompletedDate { get; set; }
}

/// <summary>
/// Raw DTO for similar professional query result
/// </summary>
internal class SimilarProfessionalRawDto
{
    public Guid ReportId { get; set; }
    public string? Name { get; set; }
    public string? Team { get; set; }
    public string? Position { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Raw DTO for player age group query result
/// </summary>
internal class PlayerAgeGroupRawDto
{
    public Guid PlayerId { get; set; }
    public Guid AgeGroupId { get; set; }
}
