namespace OurGame.Application.UseCases.Clubs.Queries.GetTrainingSessionsByClubId.DTOs;

/// <summary>
/// DTO for a training session within a club
/// </summary>
public class ClubTrainingSessionDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid AgeGroupId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string AgeGroupName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public DateTime? MeetTime { get; set; }
    public int? DurationMinutes { get; set; }
    public string Location { get; set; } = string.Empty;
    public List<string> FocusAreas { get; set; } = new();
    public List<Guid> DrillIds { get; set; } = new();
    public List<AttendanceDto> Attendance { get; set; } = new();
    public string Status { get; set; } = string.Empty;
    public bool IsLocked { get; set; }
}

/// <summary>
/// DTO for training session attendance
/// </summary>
public class AttendanceDto
{
    public Guid PlayerId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for club training sessions response
/// </summary>
public class ClubTrainingSessionsDto
{
    public List<ClubTrainingSessionDto> Sessions { get; set; } = new();
    public int TotalCount { get; set; }
}
