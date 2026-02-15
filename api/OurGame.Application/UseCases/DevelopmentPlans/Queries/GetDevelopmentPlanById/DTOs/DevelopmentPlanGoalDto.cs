namespace OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;

/// <summary>
/// DTO for a development plan goal/milestone
/// </summary>
public record DevelopmentPlanGoalDto
{
    /// <summary>
    /// Unique identifier for the goal
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Goal title/description
    /// </summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Detailed description of the goal
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Target completion date
    /// </summary>
    public DateOnly? TargetDate { get; init; }

    /// <summary>
    /// Date the goal was completed
    /// </summary>
    public DateOnly? CompletedDate { get; init; }

    /// <summary>
    /// Status of the goal
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Actions to achieve the goal
    /// </summary>
    public List<string> Actions { get; init; } = new();

    /// <summary>
    /// Progress percentage (0-100)
    /// </summary>
    public int Progress { get; init; }
}
