using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeamPlayerSquadNumber.DTOs;

/// <summary>
/// Request DTO for updating a player's squad number within a team roster.
/// </summary>
public record UpdateTeamPlayerSquadNumberRequestDto
{
    /// <summary>
    /// The new squad number/jersey number to assign to the player.
    /// Must be between 1 and 99.
    /// </summary>
    [Required]
    [Range(1, 99)]
    public int SquadNumber { get; init; }
}
