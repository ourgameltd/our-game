namespace OurGame.Application.UseCases.Reports.Commands.UpdateReport.DTOs;

/// <summary>
/// Request DTO for updating an existing report card
/// </summary>
public record UpdateReportRequestDto
{
    public DateOnly? PeriodStart { get; init; }
    public DateOnly? PeriodEnd { get; init; }
    public decimal? OverallRating { get; init; }
    public string[] Strengths { get; init; } = Array.Empty<string>();
    public string[] AreasForImprovement { get; init; } = Array.Empty<string>();
    public string CoachComments { get; init; } = string.Empty;
    public DevelopmentActionUpdateDto[] DevelopmentActions { get; init; } = Array.Empty<DevelopmentActionUpdateDto>();
    public SimilarProfessionalUpdateDto[] SimilarProfessionals { get; init; } = Array.Empty<SimilarProfessionalUpdateDto>();
}

/// <summary>
/// Development action update DTO
/// </summary>
public record DevelopmentActionUpdateDto
{
    public Guid? Id { get; init; }  // null for new actions
    public string Goal { get; init; } = string.Empty;
    public string[] Actions { get; init; } = Array.Empty<string>();
    public DateOnly? StartDate { get; init; }
    public DateOnly? TargetDate { get; init; }
    public bool Completed { get; init; }
    public DateOnly? CompletedDate { get; init; }
}

/// <summary>
/// Similar professional player update DTO
/// </summary>
public record SimilarProfessionalUpdateDto
{
    public Guid? Id { get; init; }  // null for new professionals
    public string Name { get; init; } = string.Empty;
    public string Team { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
}
