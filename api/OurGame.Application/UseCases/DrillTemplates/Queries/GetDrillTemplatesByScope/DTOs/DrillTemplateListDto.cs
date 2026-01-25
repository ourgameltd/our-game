namespace OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope.DTOs;

/// <summary>
/// Response DTO for drill templates by scope
/// </summary>
public class DrillTemplatesByScopeResponseDto
{
    /// <summary>
    /// Drill templates at the current scope level
    /// </summary>
    public List<DrillTemplateListDto> Templates { get; set; } = new();

    /// <summary>
    /// Inherited drill templates from parent scopes (club/age group)
    /// </summary>
    public List<DrillTemplateListDto> InheritedTemplates { get; set; } = new();

    /// <summary>
    /// Total count of all drill templates
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// All unique attributes from the templates for filtering
    /// </summary>
    public List<string> AvailableAttributes { get; set; } = new();
}

/// <summary>
/// DTO for drill template list item
/// </summary>
public class DrillTemplateListDto
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
    /// The scope type this drill template belongs to (club, agegroup, team)
    /// </summary>
    public string ScopeType { get; set; } = string.Empty;

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
}
