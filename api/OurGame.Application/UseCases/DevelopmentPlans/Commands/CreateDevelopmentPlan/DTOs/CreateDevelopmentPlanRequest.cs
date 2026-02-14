using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.DevelopmentPlans.Commands.CreateDevelopmentPlan.DTOs;

/// <summary>
/// Request DTO for creating a new development plan
/// </summary>
public record CreateDevelopmentPlanRequest
{
    [Required]
    public Guid PlayerId { get; init; }

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

    public List<CreateDevelopmentGoalRequest> Goals { get; init; } = new();
}

/// <summary>
/// Request DTO for a goal within a new development plan
/// </summary>
public record CreateDevelopmentGoalRequest
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
