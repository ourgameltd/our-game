namespace OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId.DTOs;

/// <summary>
/// DTO for player attendance record
/// </summary>
public record AttendanceDto
{
    /// <summary>
    /// Unique identifier of the player
    /// </summary>
    public Guid PlayerId { get; init; }

    /// <summary>
    /// Attendance status (e.g., "confirmed", "declined")
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Optional notes about attendance
    /// </summary>
    public string? Notes { get; init; }
}
