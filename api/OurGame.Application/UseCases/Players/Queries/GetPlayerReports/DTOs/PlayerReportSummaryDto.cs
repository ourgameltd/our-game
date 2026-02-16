namespace OurGame.Application.UseCases.Players.Queries.GetPlayerReports.DTOs;

/// <summary>
/// Summary DTO for player report cards in list views
/// </summary>
public record PlayerReportSummaryDto
{
    /// <summary>Report ID</summary>
    public Guid Id { get; init; }

    /// <summary>Player ID</summary>
    public Guid PlayerId { get; init; }

    /// <summary>Player first name</summary>
    public string FirstName { get; init; } = string.Empty;

    /// <summary>Player last name</summary>
    public string LastName { get; init; } = string.Empty;

    /// <summary>Player full name</summary>
    public string FullName => $"{FirstName} {LastName}";

    /// <summary>Player photo URL</summary>
    public string? PhotoUrl { get; init; }

    /// <summary>Player preferred positions</summary>
    public string[] PreferredPositions { get; init; } = Array.Empty<string>();

    /// <summary>Report period start date</summary>
    public DateTime? PeriodStart { get; init; }

    /// <summary>Report period end date</summary>
    public DateTime? PeriodEnd { get; init; }

    /// <summary>Overall rating (0-10)</summary>
    public decimal? OverallRating { get; init; }

    /// <summary>Coach who created the report (first name)</summary>
    public string? CoachFirstName { get; init; }

    /// <summary>Coach who created the report (last name)</summary>
    public string? CoachLastName { get; init; }

    /// <summary>Coach full name</summary>
    public string? CoachName => CoachFirstName != null && CoachLastName != null 
        ? $"{CoachFirstName} {CoachLastName}" 
        : null;

    /// <summary>Date report was created</summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>Number of strengths listed</summary>
    public int StrengthsCount { get; init; }

    /// <summary>Number of areas for improvement</summary>
    public int AreasForImprovementCount { get; init; }

    /// <summary>Number of development actions</summary>
    public int DevelopmentActionsCount { get; init; }
}
