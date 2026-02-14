using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.DevelopmentPlans.Commands.UpdateDevelopmentPlan.DTOs;

/// <summary>
/// Request DTO for updating an existing development plan
/// </summary>
public record UpdateDevelopmentPlanRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; init; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; init; }

    [Required]
    public DateTime PeriodStart { get; init; }

    [Required]
    public DateTime PeriodEnd { get; init; }

    [Required]
    public string Status { get; init; } = "active";

    [StringLength(4000)]
    public string? CoachNotes { get; init; }

    public List<UpdateDevelopmentGoalRequest> Goals { get; init; } = new();
}

/// <summary>
/// Request DTO for a goal within an updated development plan
/// </summary>
public record UpdateDevelopmentGoalRequest
{
    [Required]
    [StringLength(500)]
    public string Goal { get; init; } = string.Empty;

    public List<string> Actions { get; init; } = new();

    [Required]
    public DateTime StartDate { get; init; }

    [Required]
    public DateTime TargetDate { get; init; }

    public int Progress { get; init; }

    public bool Completed { get; init; }

    public DateTime? CompletedDate { get; init; }
}
