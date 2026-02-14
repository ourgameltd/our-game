using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Teams.Commands.CreateTeam.DTOs;

/// <summary>
/// Request DTO for creating a new team.
/// </summary>
public record CreateTeamRequest
{
    [Required]
    public Guid ClubId { get; init; }

    [Required]
    public Guid AgeGroupId { get; init; }

    [Required]
    [StringLength(100)]
    public string Name { get; init; } = string.Empty;

    [StringLength(50)]
    public string? ShortName { get; init; }

    [Required]
    public string Level { get; init; } = string.Empty; // "youth", "amateur", "reserve", "senior"

    [Required]
    [StringLength(20)]
    public string Season { get; init; } = string.Empty;

    [Required]
    [StringLength(7)]
    [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "PrimaryColor must be a valid hex color (#RRGGBB).")]
    public string PrimaryColor { get; init; } = string.Empty;

    [Required]
    [StringLength(7)]
    [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "SecondaryColor must be a valid hex color (#RRGGBB).")]
    public string SecondaryColor { get; init; } = string.Empty;
}
