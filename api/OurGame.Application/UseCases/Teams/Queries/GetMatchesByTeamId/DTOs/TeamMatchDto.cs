namespace OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId.DTOs;

/// <summary>
/// DTO for an individual team match
/// </summary>
public record TeamMatchDto
{
    /// <summary>
    /// Unique identifier of the match
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Date of the match
    /// </summary>
    public DateTime Date { get; init; }

    /// <summary>
    /// Kick-off time for the match
    /// </summary>
    public DateTime KickOffTime { get; init; }

    /// <summary>
    /// Location where the match is played
    /// </summary>
    public string Location { get; init; } = string.Empty;

    /// <summary>
    /// Current status of the match (e.g., Scheduled, Completed, Cancelled)
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Name of the competition (e.g., League, Cup, Friendly)
    /// </summary>
    public string Competition { get; init; } = string.Empty;

    /// <summary>
    /// Name of the opposing team
    /// </summary>
    public string OpponentName { get; init; } = string.Empty;

    /// <summary>
    /// Indicates whether the match is at home
    /// </summary>
    public bool IsHome { get; init; }

    /// <summary>
    /// Score of the home team (null if match not completed)
    /// </summary>
    public int? HomeScore { get; init; }

    /// <summary>
    /// Score of the away team (null if match not completed)
    /// </summary>
    public int? AwayScore { get; init; }

    /// <summary>
    /// Indicates whether a match report exists
    /// </summary>
    public bool HasReport { get; init; }

    /// <summary>
    /// Unique identifier of the match report (null if no report exists)
    /// </summary>
    public Guid? ReportId { get; init; }
}
