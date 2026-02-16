namespace OurGame.Application.UseCases.Players.Queries.GetPlayerUpcomingMatches.DTOs;

/// <summary>
/// DTO for player upcoming match information
/// </summary>
public class PlayerUpcomingMatchDto
{
    /// <summary>
    /// Match ID for route building
    /// </summary>
    public Guid MatchId { get; set; }

    /// <summary>
    /// Team ID for route building
    /// </summary>
    public Guid TeamId { get; set; }

    /// <summary>
    /// Age group ID for route building
    /// </summary>
    public Guid AgeGroupId { get; set; }

    /// <summary>
    /// Team name for display (especially when player has multiple teams)
    /// </summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>
    /// Age group name for display context
    /// </summary>
    public string AgeGroupName { get; set; } = string.Empty;

    /// <summary>
    /// Match date
    /// </summary>
    public DateTime MatchDate { get; set; }

    /// <summary>
    /// Kickoff time
    /// </summary>
    public DateTime? KickoffTime { get; set; }

    /// <summary>
    /// Opponent team name
    /// </summary>
    public string Opponent { get; set; } = string.Empty;

    /// <summary>
    /// Home or Away indicator
    /// </summary>
    public bool IsHome { get; set; }

    /// <summary>
    /// Match location/venue
    /// </summary>
    public string? Venue { get; set; }

    /// <summary>
    /// Competition name
    /// </summary>
    public string? Competition { get; set; }
}
