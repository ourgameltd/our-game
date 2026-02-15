using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Players.Commands.UpdatePlayerAbilityEvaluation.DTOs;

/// <summary>
/// Request DTO for updating an existing player ability evaluation.
/// Contains attribute ratings and optional coach notes for a specific evaluation period.
/// </summary>
public record UpdatePlayerAbilityEvaluationRequestDto
{
    /// <summary>
    /// Date when the evaluation was performed
    /// </summary>
    [Required]
    public DateOnly EvaluatedAt { get; init; }

    /// <summary>
    /// Coach notes and feedback for this evaluation
    /// </summary>
    public string? CoachNotes { get; init; }

    /// <summary>
    /// Start date of the evaluation period (optional)
    /// </summary>
    public DateOnly? PeriodStart { get; init; }

    /// <summary>
    /// End date of the evaluation period (optional)
    /// </summary>
    public DateOnly? PeriodEnd { get; init; }

    /// <summary>
    /// List of attribute ratings for this evaluation (must contain at least one attribute)
    /// </summary>
    [Required]
    [MinLength(1, ErrorMessage = "At least one attribute rating is required")]
    public List<EvaluationAttributeRequestDto> Attributes { get; init; } = new();
}

/// <summary>
/// Request DTO for a single attribute rating within an evaluation.
/// </summary>
public record EvaluationAttributeRequestDto
{
    /// <summary>
    /// Name of the attribute (e.g., "BallControl", "Finishing", "Pace")
    /// </summary>
    [Required]
    [StringLength(50)]
    public string AttributeName { get; init; } = string.Empty;

    /// <summary>
    /// Rating value for this attribute (0-99 scale)
    /// </summary>
    [Required]
    [Range(0, 99, ErrorMessage = "Rating must be between 0 and 99")]
    public int Rating { get; init; }

    /// <summary>
    /// Optional notes specific to this attribute
    /// </summary>
    public string? Notes { get; init; }
}
