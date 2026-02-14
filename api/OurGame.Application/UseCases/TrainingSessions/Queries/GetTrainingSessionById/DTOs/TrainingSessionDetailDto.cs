namespace OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById.DTOs;

/// <summary>
/// Full training session detail DTO including drills, attendance, coaches, and applied templates
/// </summary>
public record TrainingSessionDetailDto
{
    /// <summary>Unique identifier for the training session</summary>
    public Guid Id { get; init; }

    /// <summary>The team this session belongs to</summary>
    public Guid TeamId { get; init; }

    /// <summary>The age group the team belongs to</summary>
    public Guid AgeGroupId { get; init; }

    /// <summary>Name of the team</summary>
    public string TeamName { get; init; } = string.Empty;

    /// <summary>Name of the age group</summary>
    public string AgeGroupName { get; init; } = string.Empty;

    /// <summary>Date and time of the session</summary>
    public DateTime SessionDate { get; init; }

    /// <summary>Time players should arrive before the session starts</summary>
    public DateTime? MeetTime { get; init; }

    /// <summary>Duration of the session in minutes</summary>
    public int? DurationMinutes { get; init; }

    /// <summary>Location where the session takes place</summary>
    public string Location { get; init; } = string.Empty;

    /// <summary>Areas of focus for the session (e.g. passing, defending, set pieces)</summary>
    public string[] FocusAreas { get; init; } = [];

    /// <summary>Optional drill template this session is based on</summary>
    public Guid? TemplateId { get; init; }

    /// <summary>Additional notes about the session</summary>
    public string? Notes { get; init; }

    /// <summary>Current status of the session: scheduled, in-progress, completed, or cancelled</summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>Whether the session is locked for editing</summary>
    public bool IsLocked { get; init; }

    /// <summary>When the session record was created</summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>When the session record was last updated</summary>
    public DateTime UpdatedAt { get; init; }

    /// <summary>Drills assigned to this session</summary>
    public List<SessionDrillDto> Drills { get; init; } = new();

    /// <summary>Player attendance records for this session</summary>
    public List<SessionAttendanceDto> Attendance { get; init; } = new();

    /// <summary>Coaches assigned to this session</summary>
    public List<SessionCoachDto> Coaches { get; init; } = new();

    /// <summary>Drill templates that have been applied to this session</summary>
    public List<AppliedTemplateDto> AppliedTemplates { get; init; } = new();
}

/// <summary>
/// A drill assigned to a training session, either ad-hoc or from a template
/// </summary>
public record SessionDrillDto
{
    /// <summary>Unique identifier for this session-drill assignment</summary>
    public Guid Id { get; init; }

    /// <summary>The drill being used</summary>
    public Guid DrillId { get; init; }

    /// <summary>Name of the drill</summary>
    public string DrillName { get; init; } = string.Empty;

    /// <summary>Description of the drill</summary>
    public string? Description { get; init; }

    /// <summary>Duration of the drill in minutes</summary>
    public int? DurationMinutes { get; init; }

    /// <summary>Category of the drill: technical, tactical, physical, mental, or mixed</summary>
    public string Category { get; init; } = string.Empty;

    /// <summary>Source of the drill: 'adhoc' or 'template'</summary>
    public string Source { get; init; } = string.Empty;

    /// <summary>If sourced from a template, the template ID</summary>
    public Guid? TemplateId { get; init; }

    /// <summary>Display order of the drill within the session</summary>
    public int Order { get; init; }
}

/// <summary>
/// Player attendance record for a training session
/// </summary>
public record SessionAttendanceDto
{
    /// <summary>Unique identifier for this attendance record</summary>
    public Guid Id { get; init; }

    /// <summary>The player this attendance record is for</summary>
    public Guid PlayerId { get; init; }

    /// <summary>First name of the player</summary>
    public string FirstName { get; init; } = string.Empty;

    /// <summary>Last name of the player</summary>
    public string LastName { get; init; } = string.Empty;

    /// <summary>Attendance status: confirmed, declined, or pending</summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>Optional notes about the attendance (e.g. reason for absence)</summary>
    public string? Notes { get; init; }
}

/// <summary>
/// Coach assigned to a training session
/// </summary>
public record SessionCoachDto
{
    /// <summary>Unique identifier for this session-coach assignment</summary>
    public Guid Id { get; init; }

    /// <summary>The coach assigned to this session</summary>
    public Guid CoachId { get; init; }

    /// <summary>First name of the coach</summary>
    public string FirstName { get; init; } = string.Empty;

    /// <summary>Last name of the coach</summary>
    public string LastName { get; init; } = string.Empty;

    /// <summary>Coach role: head-coach, assistant-coach, goalkeeper-coach, fitness-coach, or technical-coach</summary>
    public string Role { get; init; } = string.Empty;
}

/// <summary>
/// A drill template that has been applied to a training session
/// </summary>
public record AppliedTemplateDto
{
    /// <summary>Unique identifier for this applied template record</summary>
    public Guid Id { get; init; }

    /// <summary>The template that was applied</summary>
    public Guid TemplateId { get; init; }

    /// <summary>Name of the template</summary>
    public string TemplateName { get; init; } = string.Empty;

    /// <summary>When the template was applied to the session</summary>
    public DateTime AppliedAt { get; init; }
}
