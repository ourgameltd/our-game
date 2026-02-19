using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Teams.Commands.ArchiveTeam.DTOs;

/// <summary>
/// Request DTO for archiving or unarchiving a team.
/// </summary>
public record ArchiveTeamRequestDto
{
    /// <summary>
    /// Whether the team should be archived (true) or unarchived (false).
    /// </summary>
    [Required]
    public bool IsArchived { get; init; }
}
