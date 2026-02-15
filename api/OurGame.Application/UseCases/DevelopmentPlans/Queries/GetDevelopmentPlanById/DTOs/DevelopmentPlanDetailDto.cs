namespace OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;

/// <summary>
/// Full detail DTO for a single development plan including player and team context
/// </summary>
public record DevelopmentPlanDetailDto
{
    /// <summary>
    /// Unique identifier for the development plan
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Title of the development plan
    /// </summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Description of the development plan
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Start date of the plan period
    /// </summary>
    public DateOnly? PeriodStart { get; init; }

    /// <summary>
    /// End date of the plan period
    /// </summary>
    public DateOnly? PeriodEnd { get; init; }

    /// <summary>
    /// Status of the plan (Active, Completed, Archived)
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Coach notes about the plan
    /// </summary>
    public string? CoachNotes { get; init; }

    /// <summary>
    /// When the plan was created
    /// </summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>
    /// When the plan was last updated
    /// </summary>
    public DateTime UpdatedAt { get; init; }

    /// <summary>
    /// Player information
    /// </summary>
    public Guid PlayerId { get; init; }

    /// <summary>
    /// Player's full name
    /// </summary>
    public string PlayerName { get; init; } = string.Empty;

    /// <summary>
    /// Player's preferred positions (comma-separated)
    /// </summary>
    public string? Position { get; init; }

    /// <summary>
    /// Team ID (most recent assignment)
    /// </summary>
    public Guid? TeamId { get; init; }

    /// <summary>
    /// Team name (most recent assignment)
    /// </summary>
    public string? TeamName { get; init; }

    /// <summary>
    /// Age group ID
    /// </summary>
    public Guid? AgeGroupId { get; init; }

    /// <summary>
    /// Age group name
    /// </summary>
    public string? AgeGroupName { get; init; }

    /// <summary>
    /// Club ID
    /// </summary>
    public Guid ClubId { get; init; }

    /// <summary>
    /// Club name
    /// </summary>
    public string ClubName { get; init; } = string.Empty;

    /// <summary>
    /// List of development goals and milestones
    /// </summary>
    public List<DevelopmentPlanGoalDto> Goals { get; init; } = new();

    /// <summary>
    /// List of progress notes (if applicable)
    /// </summary>
    public List<DevelopmentPlanProgressNoteDto> ProgressNotes { get; init; } = new();

    /// <summary>
    /// List of training objectives (if applicable)
    /// </summary>
    public List<DevelopmentPlanTrainingObjectiveDto> TrainingObjectives { get; init; } = new();
}
