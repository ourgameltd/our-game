namespace OurGame.Application.UseCases.Reports.Commands.CreateReport.DTOs;

/// <summary>
/// Request DTO for creating a new report card
/// </summary>
public record CreateReportRequestDto
{
    public Guid PlayerId { get; init; }
    public DateOnly? PeriodStart { get; init; }
    public DateOnly? PeriodEnd { get; init; }
    public decimal? OverallRating { get; init; }
    public string[] Strengths { get; init; } = Array.Empty<string>();
    public string[] AreasForImprovement { get; init; } = Array.Empty<string>();
    public string CoachComments { get; init; } = string.Empty;
    public DevelopmentActionRequestDto[] DevelopmentActions { get; init; } = Array.Empty<DevelopmentActionRequestDto>();
    public SimilarProfessionalRequestDto[] SimilarProfessionals { get; init; } = Array.Empty<SimilarProfessionalRequestDto>();
}

/// <summary>
/// Development action request DTO
/// </summary>
public record DevelopmentActionRequestDto
{
    public string Goal { get; init; } = string.Empty;
    public string[] Actions { get; init; } = Array.Empty<string>();
    public DateOnly? StartDate { get; init; }
    public DateOnly? TargetDate { get; init; }
    public bool Completed { get; init; }
    public DateOnly? CompletedDate { get; init; }
}

/// <summary>
/// Similar professional player request DTO
/// </summary>
public record SimilarProfessionalRequestDto
{
    public string Name { get; init; } = string.Empty;
    public string Team { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
}
