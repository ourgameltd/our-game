namespace OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupDevelopmentPlans.DTOs;

/// <summary>
/// DTO for a development plan in the age group development plans list
/// </summary>
public record AgeGroupDevelopmentPlanSummaryDto
{
    /// <summary>The unique identifier for the development plan</summary>
    public Guid Id { get; init; }

    /// <summary>The player this plan belongs to</summary>
    public Guid PlayerId { get; init; }

    /// <summary>The title of the development plan</summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>The current status of the plan: "active", "completed", or "archived"</summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>When the plan was created</summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>When the plan was last updated</summary>
    public DateTime? UpdatedAt { get; init; }

    /// <summary>The player associated with this plan (embedded to avoid extra calls)</summary>
    public AgeGroupDevelopmentPlanPlayerDto Player { get; init; } = new();

    /// <summary>The period covered by this development plan</summary>
    public AgeGroupDevelopmentPlanPeriodDto Period { get; init; } = new();

    /// <summary>The goals within this development plan</summary>
    public List<AgeGroupDevelopmentPlanGoalSummaryDto> Goals { get; init; } = new();
}

/// <summary>
/// DTO for a player referenced in an age group development plan
/// </summary>
public record AgeGroupDevelopmentPlanPlayerDto
{
    /// <summary>The unique identifier for the player</summary>
    public Guid Id { get; init; }

    /// <summary>The player's first name</summary>
    public string FirstName { get; init; } = string.Empty;

    /// <summary>The player's last name</summary>
    public string LastName { get; init; } = string.Empty;

    /// <summary>The player's nickname</summary>
    public string? Nickname { get; init; }

    /// <summary>URL to the player's photo</summary>
    public string? Photo { get; init; }

    /// <summary>The player's preferred positions (e.g. "GK", "CB", "ST")</summary>
    public List<string> PreferredPositions { get; init; } = new();
}

/// <summary>
/// DTO for a development goal summary within an age group development plan
/// </summary>
public record AgeGroupDevelopmentPlanGoalSummaryDto
{
    /// <summary>The unique identifier for the goal</summary>
    public Guid Id { get; init; }

    /// <summary>The goal description</summary>
    public string Goal { get; init; } = string.Empty;

    /// <summary>Progress percentage (0-100)</summary>
    public int Progress { get; init; }

    /// <summary>Whether the goal has been completed</summary>
    public bool Completed { get; init; }

    /// <summary>Target date for completing the goal</summary>
    public DateOnly? TargetDate { get; init; }

    /// <summary>The date the goal was completed, if applicable</summary>
    public DateTime? CompletedDate { get; init; }
}

/// <summary>
/// DTO for the period covered by a development plan
/// </summary>
public record AgeGroupDevelopmentPlanPeriodDto
{
    /// <summary>Start date of the plan period</summary>
    public DateOnly? Start { get; init; }

    /// <summary>End date of the plan period</summary>
    public DateOnly? End { get; init; }
}
