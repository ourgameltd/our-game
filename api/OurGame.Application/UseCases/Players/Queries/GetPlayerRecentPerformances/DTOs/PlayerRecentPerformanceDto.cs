namespace OurGame.Application.UseCases.Players.Queries.GetPlayerRecentPerformances.DTOs;

/// <summary>
/// DTO for a single recent match performance
/// </summary>
public class PlayerRecentPerformanceDto
{
    /// <summary>Match ID for navigation</summary>
    public Guid MatchId { get; init; }

    /// <summary>Team ID for route building</summary>
    public Guid TeamId { get; init; }

    /// <summary>Age group ID for route building</summary>
    public Guid AgeGroupId { get; init; }

    /// <summary>Match date</summary>
    public DateTime MatchDate { get; init; }

    /// <summary>Opposition team name</summary>
    public string Opponent { get; init; } = string.Empty;

    /// <summary>Home or Away</summary>
    public string HomeAway { get; init; } = string.Empty;

    /// <summary>Match result (e.g., "W 3-1", "L 1-2", "D 2-2")</summary>
    public string Result { get; init; } = string.Empty;

    /// <summary>Player's performance rating</summary>
    public decimal? Rating { get; init; }

    /// <summary>Number of goals scored</summary>
    public int Goals { get; init; }

    /// <summary>Number of assists</summary>
    public int Assists { get; init; }

    /// <summary>Competition name (optional)</summary>
    public string? Competition { get; init; }
}
