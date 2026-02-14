namespace OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;

/// <summary>
/// DTO for development plan detail including goals
/// </summary>
public record DevelopmentPlanDto
{
    public Guid Id { get; init; }
    public Guid PlayerId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime PeriodStart { get; init; }
    public DateTime PeriodEnd { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? CoachNotes { get; init; }
    public List<DevelopmentGoalDto> Goals { get; init; } = new();
}

/// <summary>
/// DTO for a single development goal within a plan
/// </summary>
public record DevelopmentGoalDto
{
    public Guid Id { get; init; }
    public string Goal { get; init; } = string.Empty;
    public List<string> Actions { get; init; } = new();
    public DateTime StartDate { get; init; }
    public DateTime TargetDate { get; init; }
    public int Progress { get; init; }
    public bool Completed { get; init; }
    public DateTime? CompletedDate { get; init; }
}
