using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.TrainingSessions.Commands.UpdateTrainingSession.DTOs;

/// <summary>
/// Request DTO for updating an existing training session
/// </summary>
public record UpdateTrainingSessionRequest
{
    [Required]
    public Guid TeamId { get; init; }

    [Required]
    public DateTime SessionDate { get; init; }

    public DateTime? MeetTime { get; init; }

    [Range(1, 480)]
    public int? DurationMinutes { get; init; }

    [StringLength(500)]
    public string? Location { get; init; }

    /// <summary>
    /// Areas of focus for this session (e.g. "passing", "defending", "set pieces").
    /// Serialized to JSON for storage.
    /// </summary>
    public List<string> FocusAreas { get; init; } = new();

    public Guid? TemplateId { get; init; }

    [StringLength(4000)]
    public string? Notes { get; init; }

    /// <summary>
    /// Session status: scheduled, in-progress, completed, cancelled
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Status { get; init; } = "scheduled";

    /// <summary>
    /// Whether the session is locked for editing
    /// </summary>
    public bool IsLocked { get; init; }

    /// <summary>
    /// Drills assigned to this session in order. Replaced entirely on update.
    /// </summary>
    public List<UpdateSessionDrillRequest> Drills { get; init; } = new();

    /// <summary>
    /// Coach IDs assigned to run this session. Replaced entirely on update.
    /// </summary>
    public List<Guid> CoachIds { get; init; } = new();

    /// <summary>
    /// Player attendance records. Replaced entirely on update.
    /// Status string is mapped to Present nullable bool: "confirmed" → true, "declined" → false, others → null.
    /// </summary>
    public List<UpdateSessionAttendanceRequest> Attendance { get; init; } = new();

    /// <summary>
    /// Drill templates applied to this session. Replaced entirely on update.
    /// Timestamps are preserved from the request, not overwritten with UtcNow.
    /// </summary>
    public List<UpdateAppliedTemplateRequest> AppliedTemplates { get; init; } = new();
}

/// <summary>
/// Drill entry in a training session for update (replaces existing)
/// </summary>
public record UpdateSessionDrillRequest
{
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
/// Player attendance entry for update. Status string is mapped to Present nullable bool.
/// </summary>
public record UpdateSessionAttendanceRequest
{
    [Required]
    public Guid PlayerId { get; init; }

    /// <summary>
    /// Attendance status: "confirmed" → present, "declined" → absent, "pending"/"maybe" → unknown
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Status { get; init; } = string.Empty;

    [StringLength(1000)]
    public string? Notes { get; init; }
}

/// <summary>
/// Applied template entry for update. Timestamps are preserved from the request.
/// </summary>
public record UpdateAppliedTemplateRequest
{
    [Required]
    public Guid TemplateId { get; init; }

    [Required]
    public DateTime AppliedAt { get; init; }
}
