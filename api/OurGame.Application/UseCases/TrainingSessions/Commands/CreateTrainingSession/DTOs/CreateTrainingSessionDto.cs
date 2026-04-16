using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession.DTOs;

/// <summary>
/// Request DTO for creating a new training session with drills, coaches, attendance, and applied templates
/// </summary>
public record CreateTrainingSessionDto
{
    /// <summary>
    /// The team this session belongs to
    /// </summary>
    [Required]
    public Guid TeamId { get; init; }

    /// <summary>
    /// Date and time of the training session
    /// </summary>
    [Required]
    public DateTime SessionDate { get; init; }

    /// <summary>
    /// Optional meet time before the session starts
    /// </summary>
    public DateTime? MeetTime { get; init; }

    /// <summary>
    /// Duration of the session in minutes
    /// </summary>
    [Range(1, 480)]
    public int? DurationMinutes { get; init; }

    /// <summary>
    /// Venue or pitch location for the session
    /// </summary>
    [StringLength(500)]
    public string? Location { get; init; }

    /// <summary>
    /// Areas of focus for this session (e.g. "passing", "defending", "set pieces")
    /// </summary>
    public List<string> FocusAreas { get; init; } = new();

    /// <summary>
    /// Optional free-text notes about the session
    /// </summary>
    [StringLength(4000)]
    public string? Notes { get; init; }

    /// <summary>
    /// Session status: Scheduled, InProgress, Completed, or Cancelled
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Status { get; init; } = "Scheduled";

    /// <summary>
    /// Whether the session is locked from further edits
    /// </summary>
    public bool IsLocked { get; init; }

    /// <summary>
    /// Drills assigned to this session in order
    /// </summary>
    public List<CreateSessionDrillDto> SessionDrills { get; init; } = new();

    /// <summary>
    /// Coach IDs assigned to run this session
    /// </summary>
    public List<Guid> AssignedCoachIds { get; init; } = new();

    /// <summary>
    /// Player attendance records for this session
    /// </summary>
    public List<CreateSessionAttendanceDto> Attendance { get; init; } = new();

    /// <summary>
    /// Drill templates applied to this session
    /// </summary>
    public List<CreateAppliedTemplateDto> AppliedTemplates { get; init; } = new();
}

/// <summary>
/// A drill to include in the training session
/// </summary>
public record CreateSessionDrillDto
{
    /// <summary>
    /// The drill to include
    /// </summary>
    [Required]
    public Guid DrillId { get; init; }

    /// <summary>
    /// Source of the drill (e.g. "manual", "template")
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Source { get; init; } = string.Empty;

    /// <summary>
    /// Optional template this drill originated from
    /// </summary>
    public Guid? TemplateId { get; init; }

    /// <summary>
    /// Display order of the drill within the session (0-based)
    /// </summary>
    [Required]
    [Range(0, 100)]
    public int Order { get; init; }
}

/// <summary>
/// Attendance record for a player in the training session
/// </summary>
public record CreateSessionAttendanceDto
{
    /// <summary>
    /// The player this attendance record is for
    /// </summary>
    [Required]
    public Guid PlayerId { get; init; }

    /// <summary>
    /// Whether the player was present
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Optional notes about the player's attendance (e.g. reason for absence)
    /// </summary>
    [StringLength(1000)]
    public string? Notes { get; init; }
}

/// <summary>
/// A drill template applied to this session
/// </summary>
public record CreateAppliedTemplateDto
{
    /// <summary>
    /// The drill template that was applied
    /// </summary>
    [Required]
    public Guid TemplateId { get; init; }

    /// <summary>
    /// When the template was applied to the session
    /// </summary>
    [Required]
    public DateTime AppliedAt { get; init; }
}
