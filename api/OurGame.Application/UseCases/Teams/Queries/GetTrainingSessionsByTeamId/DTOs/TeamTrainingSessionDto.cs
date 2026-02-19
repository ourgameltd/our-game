namespace OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId.DTOs;

/// <summary>
/// DTO for an individual team training session
/// </summary>
public record TeamTrainingSessionDto
{
    /// <summary>
    /// Unique identifier of the training session
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Date of the training session
    /// </summary>
    public DateTime Date { get; init; }

    /// <summary>
    /// Meet time for the training session
    /// </summary>
    public DateTime? MeetTime { get; init; }

    /// <summary>
    /// Duration of the session in minutes
    /// </summary>
    public int? DurationMinutes { get; init; }

    /// <summary>
    /// Location where the training session is held
    /// </summary>
    public string Location { get; init; } = string.Empty;

    /// <summary>
    /// Focus areas for the training session (e.g., Passing, Shooting)
    /// </summary>
    public List<string> FocusAreas { get; init; } = new();

    /// <summary>
    /// List of drill IDs included in the session
    /// </summary>
    public List<Guid> DrillIds { get; init; } = new();

    /// <summary>
    /// Player attendance records
    /// </summary>
    public List<AttendanceDto> Attendance { get; init; } = new();

    /// <summary>
    /// Current status of the session (e.g., Scheduled, Completed, Cancelled)
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Indicates whether the session is locked for editing
    /// </summary>
    public bool IsLocked { get; init; }

    /// <summary>
    /// Number of drills in the session
    /// </summary>
    public int DrillCount { get; init; }

    /// <summary>
    /// Number of players who attended
    /// </summary>
    public int AttendanceCount { get; init; }
}
