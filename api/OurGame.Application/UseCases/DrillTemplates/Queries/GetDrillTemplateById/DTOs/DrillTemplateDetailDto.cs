namespace OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById.DTOs;

/// <summary>
/// Full detail DTO for a single drill template
/// </summary>
public class DrillTemplateDetailDto
{
    /// <summary>
    /// Unique identifier for the drill template
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name of the drill template
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of the drill template
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// List of drill IDs in order
    /// </summary>
    public List<Guid> DrillIds { get; set; } = new();

    /// <summary>
    /// Total duration in minutes (calculated from drills)
    /// </summary>
    public int TotalDuration { get; set; }

    /// <summary>
    /// Category of the template (technical, tactical, physical, mental, mixed)
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Aggregated attributes from included drills
    /// </summary>
    public List<string> Attributes { get; set; } = new();

    /// <summary>
    /// Whether the template is public/shared
    /// </summary>
    public bool IsPublic { get; set; }

    /// <summary>
    /// ID of the coach who created the template
    /// </summary>
    public Guid? CreatedBy { get; set; }

    /// <summary>
    /// When the template was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// The scope type this drill template belongs to (club, agegroup, team)
    /// </summary>
    public string ScopeType { get; set; } = string.Empty;

    /// <summary>
    /// Club ID if template is club-scoped
    /// </summary>
    public Guid? ScopeClubId { get; set; }

    /// <summary>
    /// Age Group ID if template is age group-scoped
    /// </summary>
    public Guid? ScopeAgeGroupId { get; set; }

    /// <summary>
    /// Team ID if template is team-scoped
    /// </summary>
    public Guid? ScopeTeamId { get; set; }
}
