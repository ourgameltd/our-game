using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Teams.Commands.AddPlayerToTeam.DTOs;

/// <summary>
/// Request DTO for adding a player to a team roster.
/// </summary>
public record AddPlayerToTeamRequestDto
{
    /// <summary>
    /// The unique identifier of the player to add to the team.
    /// </summary>
    [Required]
    public Guid PlayerId { get; init; }

    /// <summary>
    /// The squad number/jersey number to assign to the player.
    /// Must be between 1 and 99.
    /// </summary>
    [Required]
    [Range(1, 99)]
    public int SquadNumber { get; init; }
}
