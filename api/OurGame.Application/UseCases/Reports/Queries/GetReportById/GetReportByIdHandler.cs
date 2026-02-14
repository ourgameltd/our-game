using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Reports.Queries.GetReportById.DTOs;
using OurGame.Persistence.Models;
using System.Text.Json;

namespace OurGame.Application.UseCases.Reports.Queries.GetReportById;

/// <summary>
/// Query to get report card details by ID
/// </summary>
public record GetReportByIdQuery(Guid ReportId) : IQuery<ReportDto?>;

/// <summary>
/// Handler for GetReportByIdQuery.
/// Returns detailed report card information including development actions and similar professionals.
/// </summary>
public class GetReportByIdHandler : IRequestHandler<GetReportByIdQuery, ReportDto?>
{
    private readonly OurGameContext _db;

    public GetReportByIdHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<ReportDto?> Handle(GetReportByIdQuery query, CancellationToken cancellationToken)
    {
        // 1. Fetch base report data with player and coach names
        var reportSql = @"
            SELECT 
                r.Id,
                r.PlayerId,
                CONCAT(p.FirstName, ' ', p.LastName) AS PlayerName,
                r.PeriodStart,
                r.PeriodEnd,
                r.OverallRating,
                r.Strengths,
                r.AreasForImprovement,
                r.CoachComments,
                r.CreatedBy,
                CONCAT(c.FirstName, ' ', c.LastName) AS CreatedByName,
                r.CreatedAt
            FROM PlayerReports r
            INNER JOIN Players p ON p.Id = r.PlayerId
            LEFT JOIN Coaches c ON c.Id = r.CreatedBy
            WHERE r.Id = {0}";

        var report = await _db.Database
            .SqlQueryRaw<ReportBaseRawDto>(reportSql, query.ReportId)
            .FirstOrDefaultAsync(cancellationToken);

        if (report == null)
        {
            return null;
        }

        // 2. Fetch development actions for this report
        var actionsSql = @"
            SELECT 
                Id,
                Goal,
                Actions,
                StartDate,
                TargetDate,
                Completed,
                CompletedDate
            FROM ReportDevelopmentActions
            WHERE ReportId = {0}
            ORDER BY StartDate, TargetDate";

        var actionsData = await _db.Database
            .SqlQueryRaw<DevelopmentActionRawDto>(actionsSql, query.ReportId)
            .ToListAsync(cancellationToken);

        // 3. Fetch similar professionals for this report
        var professionalsSql = @"
            SELECT 
                Id,
                Name,
                Team,
                Position,
                Reason
            FROM SimilarProfessionals
            WHERE ReportId = {0}
            ORDER BY Name";

        var professionalsData = await _db.Database
            .SqlQueryRaw<SimilarProfessionalRawDto>(professionalsSql, query.ReportId)
            .ToListAsync(cancellationToken);

        // 4. Parse JSON arrays and build DTOs
        var strengths = ParseStringArray(report.Strengths);
        var improvements = ParseStringArray(report.AreasForImprovement);

        var developmentActions = actionsData
            .Select(a => new DevelopmentActionDto
            {
                Id = a.Id,
                Goal = a.Goal ?? string.Empty,
                Actions = ParseStringArray(a.Actions),
                StartDate = a.StartDate,
                TargetDate = a.TargetDate,
                Completed = a.Completed,
                CompletedDate = a.CompletedDate
            })
            .ToArray();

        var similarProfessionals = professionalsData
            .Select(sp => new SimilarProfessionalDto
            {
                Id = sp.Id,
                Name = sp.Name ?? string.Empty,
                Team = sp.Team ?? string.Empty,
                Position = sp.Position ?? string.Empty,
                Reason = sp.Reason ?? string.Empty
            })
            .ToArray();

        // 5. Return mapped DTO
        return new ReportDto
        {
            Id = report.Id,
            PlayerId = report.PlayerId,
            PlayerName = report.PlayerName ?? string.Empty,
            PeriodStart = report.PeriodStart,
            PeriodEnd = report.PeriodEnd,
            OverallRating = report.OverallRating,
            Strengths = strengths,
            AreasForImprovement = improvements,
            CoachComments = report.CoachComments ?? string.Empty,
            CreatedBy = report.CreatedBy,
            CreatedByName = report.CreatedByName ?? string.Empty,
            CreatedAt = report.CreatedAt,
            DevelopmentActions = developmentActions,
            SimilarProfessionals = similarProfessionals
        };
    }

    private static string[] ParseStringArray(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return Array.Empty<string>();

        try
        {
            var result = JsonSerializer.Deserialize<string[]>(json);
            return result ?? Array.Empty<string>();
        }
        catch (JsonException)
        {
            // Fallback: treat as single item
            return new[] { json };
        }
    }
}

/// <summary>
/// Raw SQL result for base report data
/// </summary>
public class ReportBaseRawDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string? PlayerName { get; set; }
    public DateOnly? PeriodStart { get; set; }
    public DateOnly? PeriodEnd { get; set; }
    public decimal? OverallRating { get; set; }
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public string? CoachComments { get; set; }
    public Guid? CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Raw SQL result for development action data
/// </summary>
public class DevelopmentActionRawDto
{
    public Guid Id { get; set; }
    public string? Goal { get; set; }
    public string? Actions { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? TargetDate { get; set; }
    public bool Completed { get; set; }
    public DateOnly? CompletedDate { get; set; }
}

/// <summary>
/// Raw SQL result for similar professional data
/// </summary>
public class SimilarProfessionalRawDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Team { get; set; }
    public string? Position { get; set; }
    public string? Reason { get; set; }
}
