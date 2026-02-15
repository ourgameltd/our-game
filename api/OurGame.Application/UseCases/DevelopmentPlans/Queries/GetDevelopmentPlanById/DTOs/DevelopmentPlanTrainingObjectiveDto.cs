namespace OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;

/// <summary>
/// DTO for a development plan training objective
/// </summary>
public record DevelopmentPlanTrainingObjectiveDto
{
    /// <summary>
    /// Unique identifier for the objective
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Title of the training objective
    /// </summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Detailed description of the objective
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Start date of the objective
    /// </summary>
    public DateOnly? StartDate { get; init; }

    /// <summary>
    /// Target completion date
    /// </summary>
    public DateOnly? TargetDate { get; init; }

    /// <summary>
    /// Status of the objective
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Progress percentage (0-100)
    /// </summary>
    public int Progress { get; init; }

    /// <summary>
    /// Whether the objective is completed
    /// </summary>
    public bool Completed { get; init; }

    /// <summary>
    /// Date the objective was completed
    /// </summary>
    public DateOnly? CompletedDate { get; init; }
}
