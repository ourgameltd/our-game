namespace OurGame.Application.UseCases.Reports.Queries.GetReportById.DTOs;

/// <summary>
/// Report card detail DTO
/// </summary>
public record ReportDto
{
    public Guid Id { get; init; }
    public Guid PlayerId { get; init; }
    public string PlayerName { get; init; } = string.Empty;
    public DateOnly? PeriodStart { get; init; }
    public DateOnly? PeriodEnd { get; init; }
    public decimal? OverallRating { get; init; }
    public string[] Strengths { get; init; } = Array.Empty<string>();
    public string[] AreasForImprovement { get; init; } = Array.Empty<string>();
    public string CoachComments { get; init; } = string.Empty;
    public Guid? CreatedBy { get; init; }
    public string CreatedByName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DevelopmentActionDto[] DevelopmentActions { get; init; } = Array.Empty<DevelopmentActionDto>();
    public SimilarProfessionalDto[] SimilarProfessionals { get; init; } = Array.Empty<SimilarProfessionalDto>();
}

/// <summary>
/// Development action DTO
/// </summary>
public record DevelopmentActionDto
{
    public Guid Id { get; init; }
    public string Goal { get; init; } = string.Empty;
    public string[] Actions { get; init; } = Array.Empty<string>();
    public DateOnly? StartDate { get; init; }
    public DateOnly? TargetDate { get; init; }
    public bool Completed { get; init; }
    public DateOnly? CompletedDate { get; init; }
}

/// <summary>
/// Similar professional player DTO
/// </summary>
public record SimilarProfessionalDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Team { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
}
