namespace OurGame.Application.UseCases.Teams.Queries.GetPlayersByTeamId.DTOs;

/// <summary>
/// DTO representing a player within a team squad
/// </summary>
public class TeamPlayerDto
{
    /// <summary>
    /// The unique identifier of the player
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The player's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// The player's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// URL to the player's photo
    /// </summary>
    public string? PhotoUrl { get; set; }

    /// <summary>
    /// The player's preferred playing positions
    /// </summary>
    public List<string> PreferredPositions { get; set; } = new();

    /// <summary>
    /// The player's overall ability rating (0-99)
    /// </summary>
    public int? OverallRating { get; set; }

    /// <summary>
    /// The player's squad number within this team
    /// </summary>
    public int? SquadNumber { get; set; }
}
