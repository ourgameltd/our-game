namespace OurGame.Application.UseCases.Teams.Commands.AddPlayerToTeam.DTOs;

/// <summary>
/// Result DTO returned after successfully adding a player to a team roster.
/// </summary>
public record AddPlayerToTeamResultDto
{
    /// <summary>
    /// The unique identifier of the player that was added to the team.
    /// </summary>
    public Guid PlayerId { get; init; }

    /// <summary>
    /// The unique identifier of the team the player was added to.
    /// </summary>
    public Guid TeamId { get; init; }

    /// <summary>
    /// The squad number/jersey number assigned to the player.
    /// </summary>
    public int SquadNumber { get; init; }
}
