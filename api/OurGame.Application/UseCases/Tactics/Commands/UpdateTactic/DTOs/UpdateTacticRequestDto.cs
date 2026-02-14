using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Tactics.Commands.UpdateTactic.DTOs;

/// <summary>
/// Request DTO for updating an existing tactic.
/// Same shape as CreateTacticRequestDto — parentFormationId and scope are ignored if they differ from stored values.
/// </summary>
public record UpdateTacticRequestDto
{
    /// <summary>
    /// Tactic name
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The parent formation this tactic is based on (cannot be changed; ignored if different)
    /// </summary>
    [Required]
    public Guid ParentFormationId { get; init; }

    /// <summary>
    /// Optional parent tactic this tactic inherits from (cannot be changed; ignored if different)
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
    /// Position overrides adjusting coordinates/direction from the parent formation
    /// </summary>
    public List<UpdatePositionOverrideDto> PositionOverrides { get; init; } = new();

    /// <summary>
    /// Tactical principles with associated positions
    /// </summary>
    public List<UpdateTacticPrincipleDto> Principles { get; init; } = new();
}

/// <summary>
/// Position override adjusting a single position from the parent formation
/// </summary>
public record UpdatePositionOverrideDto
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
public record UpdateTacticPrincipleDto
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
