using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeam.DTOs;

/// <summary>
/// Request DTO for updating an existing team.
/// Does not include ClubId or AgeGroupId — teams cannot be moved between clubs or age groups.
/// </summary>
public record UpdateTeamRequestDto
{
    /// <summary>
    /// Display name for the team (e.g. "Reds", "Blues").
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Optional short name / abbreviation for the team.
    /// </summary>
    [StringLength(50)]
    public string? ShortName { get; init; }

    /// <summary>
    /// Competition level: youth, amateur, reserve, or senior.
    /// </summary>
    [Required]
    public string Level { get; init; } = string.Empty;

    /// <summary>
    /// Season identifier (e.g. "2025/26").
    /// </summary>
    [Required]
    [StringLength(20)]
    public string Season { get; init; } = string.Empty;

    /// <summary>
    /// Primary team color in hex format (#RRGGBB).
    /// </summary>
    [Required]
    [StringLength(7)]
    public string PrimaryColor { get; init; } = string.Empty;

    /// <summary>
    /// Secondary team color in hex format (#RRGGBB).
    /// </summary>
    [Required]
    [StringLength(7)]
    public string SecondaryColor { get; init; } = string.Empty;
}
