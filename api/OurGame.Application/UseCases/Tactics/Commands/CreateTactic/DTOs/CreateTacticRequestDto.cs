using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Tactics.Commands.CreateTactic.DTOs;

/// <summary>
/// Request DTO for creating a new tactic
/// </summary>
public record CreateTacticRequestDto
{
    /// <summary>
    /// Tactic name
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The parent formation this tactic is based on
    /// </summary>
    [Required]
    public Guid ParentFormationId { get; init; }

    /// <summary>
    /// Optional parent tactic this tactic inherits from
    /// </summary>
    public Guid? ParentTacticId { get; init; }

    /// <summary>
    /// Short summary of the tactic
    /// </summary>
    [StringLength(1000)]
    public string? Summary { get; init; }

    /// <summary>
    /// Playing style (e.g. "attacking", "defensive", "balanced")
    /// </summary>
    [StringLength(100)]
    public string? Style { get; init; }

    /// <summary>
    /// Tags for categorising the tactic
    /// </summary>
    public List<string> Tags { get; init; } = new();

    /// <summary>
    /// Scope assignment for this tactic (club, ageGroup, or team)
    /// </summary>
    [Required]
    public CreateTacticScopeDto Scope { get; init; } = new();

    /// <summary>
    /// Position overrides adjusting coordinates/direction from the parent formation
    /// </summary>
    public List<CreatePositionOverrideDto> PositionOverrides { get; init; } = new();

    /// <summary>
    /// Tactical principles with associated positions
    /// </summary>
    public List<CreateTacticPrincipleDto> Principles { get; init; } = new();
}

/// <summary>
/// Scope assignment for the tactic
/// </summary>
public record CreateTacticScopeDto
{
    /// <summary>
    /// Scope type: "club", "ageGroup", or "team"
    /// </summary>
    [Required]
    [StringLength(20)]
    public string Type { get; init; } = string.Empty;

    /// <summary>
    /// Club ID (required for all scope types)
    /// </summary>
    [Required]
    public Guid ClubId { get; init; }

    /// <summary>
    /// Age group ID (required when type is "ageGroup" or "team")
    /// </summary>
    public Guid? AgeGroupId { get; init; }

    /// <summary>
    /// Team ID (required when type is "team")
    /// </summary>
    public Guid? TeamId { get; init; }
}

/// <summary>
/// Position override adjusting a single position from the parent formation
/// </summary>
public record CreatePositionOverrideDto
{
    /// <summary>
    /// Index of the position in the formation (0-based)
    /// </summary>
    [Required]
    public int PositionIndex { get; init; }

    /// <summary>
    /// Overridden X coordinate on the pitch
    /// </summary>
    public decimal? XCoord { get; init; }

    /// <summary>
    /// Overridden Y coordinate on the pitch
    /// </summary>
    public decimal? YCoord { get; init; }

    /// <summary>
    /// Overridden facing direction
    /// </summary>
    [StringLength(50)]
    public string? Direction { get; init; }
}

/// <summary>
/// A tactical principle with associated positions
/// </summary>
public record CreateTacticPrincipleDto
{
    /// <summary>
    /// Title of the principle
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Detailed description of the principle
    /// </summary>
    [StringLength(4000)]
    public string? Description { get; init; }

    /// <summary>
    /// Indices of positions this principle applies to
    /// </summary>
    public List<int> PositionIndices { get; init; } = new();
}
