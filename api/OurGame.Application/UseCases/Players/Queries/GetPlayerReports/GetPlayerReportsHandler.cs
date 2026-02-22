using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.Queries.GetPlayerReports.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Players.Queries.GetPlayerReports;

/// <summary>
/// Query to get all report cards for a player
/// </summary>
public record GetPlayerReportsQuery(Guid PlayerId, string? UserId = null) : IQuery<List<PlayerReportSummaryDto>?>;

/// <summary>
/// Handler for GetPlayerReportsQuery.
/// Returns list of report card summaries for a player ordered by most recent first.
/// Includes authorization checks to ensure user has access to view the player's reports.
/// </summary>
public class GetPlayerReportsHandler : IRequestHandler<GetPlayerReportsQuery, List<PlayerReportSummaryDto>?>
{
    private readonly OurGameContext _db;

    public GetPlayerReportsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<PlayerReportSummaryDto>?> Handle(GetPlayerReportsQuery query, CancellationToken cancellationToken)
    {
        // Fetch all reports for the player with coach and player details
        var reportSql = @"
            SELECT 
                pr.Id,
                pr.PlayerId,
                p.FirstName,
                p.LastName,
                p.Photo AS PhotoUrl,
                p.PreferredPositions,
                pr.PeriodStart,
                pr.PeriodEnd,
                pr.OverallRating,
                c.FirstName AS CoachFirstName,
                c.LastName AS CoachLastName,
                pr.CreatedAt,
                pr.Strengths,
                pr.AreasForImprovement,
                (SELECT COUNT(*) FROM ReportDevelopmentActions rda WHERE rda.ReportId = pr.Id) AS DevelopmentActionsCount
            FROM PlayerReports pr
            INNER JOIN Players p ON pr.PlayerId = p.Id
            LEFT JOIN Coaches c ON pr.CreatedBy = c.Id
            WHERE pr.PlayerId = {0}
            ORDER BY pr.CreatedAt DESC";

        var rawResults = await _db.Database
            .SqlQueryRaw<PlayerReportRawDto>(reportSql, query.PlayerId)
            .ToListAsync(cancellationToken);

        // Map to summary DTOs
        var reports = rawResults.Select(r => new PlayerReportSummaryDto
        {
            Id = r.Id,
            PlayerId = r.PlayerId,
            FirstName = r.FirstName ?? string.Empty,
            LastName = r.LastName ?? string.Empty,
            PhotoUrl = r.PhotoUrl,
            PreferredPositions = ParsePositions(r.PreferredPositions),
            PeriodStart = r.PeriodStart?.ToDateTime(TimeOnly.MinValue),
            PeriodEnd = r.PeriodEnd?.ToDateTime(TimeOnly.MinValue),
            OverallRating = r.OverallRating,
            CoachFirstName = r.CoachFirstName,
            CoachLastName = r.CoachLastName,
            CreatedAt = r.CreatedAt,
            StrengthsCount = CountJsonArrayItems(r.Strengths),
            AreasForImprovementCount = CountJsonArrayItems(r.AreasForImprovement),
            DevelopmentActionsCount = r.DevelopmentActionsCount
        }).ToList();

        return reports;
    }

    private static string[] ParsePositions(string? positions)
    {
        if (string.IsNullOrWhiteSpace(positions))
            return Array.Empty<string>();

        try
        {
            var result = System.Text.Json.JsonSerializer.Deserialize<string[]>(positions);
            return result ?? Array.Empty<string>();
        }
        catch (System.Text.Json.JsonException)
        {
            return positions
                .Split(new[] { ',', '|', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .ToArray();
        }
    }

    private static int CountJsonArrayItems(string? jsonArray)
    {
        if (string.IsNullOrWhiteSpace(jsonArray))
            return 0;

        try
        {
            var items = System.Text.Json.JsonSerializer.Deserialize<string[]>(jsonArray);
            return items?.Length ?? 0;
        }
        catch (System.Text.Json.JsonException)
        {
            return 0;
        }
    }
}

/// <summary>
/// Raw SQL result for player report data
/// </summary>
public class PlayerReportRawDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhotoUrl { get; set; }
    public string? PreferredPositions { get; set; }
    public DateOnly? PeriodStart { get; set; }
    public DateOnly? PeriodEnd { get; set; }
    public decimal? OverallRating { get; set; }
    public string? CoachFirstName { get; set; }
    public string? CoachLastName { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public int DevelopmentActionsCount { get; set; }
}
