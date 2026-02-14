using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.AgeGroups.Commands.UpdateAgeGroup.DTOs;

/// <summary>
/// Request DTO for updating an existing age group.
/// </summary>
/// <remarks>
/// Contains all fields for a full PUT update of an age group.
/// The <c>Seasons</c> and <c>DefaultSeason</c> fields are optional for backward compatibility —
/// if omitted, they are derived from <c>Season</c>.
/// </remarks>
public record UpdateAgeGroupRequestDto
{
    /// <summary>
    /// The club this age group belongs to.
    /// </summary>
    [Required]
    public Guid ClubId { get; init; }

    /// <summary>
    /// Display name for the age group (e.g. "2015s", "Under 10s").
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Short code for the age group (e.g. "U10", "2015").
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Code { get; init; } = string.Empty;

    /// <summary>
    /// Competition level: youth, amateur, reserve, or senior.
    /// </summary>
    [Required]
    public string Level { get; init; } = string.Empty;

    /// <summary>
    /// The current / primary season identifier (e.g. "2025/26").
    /// </summary>
    [Required]
    [StringLength(20)]
    public string Season { get; init; } = string.Empty;

    /// <summary>
    /// Default squad size for this age group (4, 5, 7, 9, or 11).
    /// </summary>
    [Required]
    public int DefaultSquadSize { get; init; }

    /// <summary>
    /// Optional description of the age group.
    /// </summary>
    [StringLength(500)]
    public string? Description { get; init; }

    /// <summary>
    /// List of season identifiers this age group spans.
    /// If omitted or empty, derived from <c>Season</c> for backward compatibility.
    /// </summary>
    public List<string>? Seasons { get; init; }

    /// <summary>
    /// The default season to display. Must be contained in <c>Seasons</c>.
    /// If omitted, defaults to the first season in the list.
    /// </summary>
    public string? DefaultSeason { get; init; }
}
