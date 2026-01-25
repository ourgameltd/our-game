namespace OurGame.Application.UseCases.Drills.Queries.GetDrillsByScope.DTOs;

/// <summary>
/// Response DTO for drills by scope
/// </summary>
public class DrillsByScopeResponseDto
{
    /// <summary>
    /// Drills at the current scope level
    /// </summary>
    public List<DrillListDto> Drills { get; set; } = new();

    /// <summary>
    /// Inherited drills from parent scopes (club/age group)
    /// </summary>
    public List<DrillListDto> InheritedDrills { get; set; } = new();

    /// <summary>
    /// Total count of all drills
    /// </summary>
    public int TotalCount { get; set; }
}

/// <summary>
/// DTO for drill list item
/// </summary>
public class DrillListDto
{
    /// <summary>
    /// Unique identifier for the drill
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name of the drill
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of the drill
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Duration of the drill in minutes
    /// </summary>
    public int Duration { get; set; }

    /// <summary>
    /// Category of the drill (technical, tactical, physical, mental)
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// List of player attributes this drill improves
    /// </summary>
    public List<string> Attributes { get; set; } = new();

    /// <summary>
    /// List of equipment needed for the drill
    /// </summary>
    public List<string> Equipment { get; set; } = new();

    /// <summary>
    /// Optional diagram/image URL for the drill
    /// </summary>
    public string? Diagram { get; set; }

    /// <summary>
    /// Instructions for the drill
    /// </summary>
    public List<string> Instructions { get; set; } = new();

    /// <summary>
    /// Optional variations of the drill
    /// </summary>
    public List<string> Variations { get; set; } = new();

    /// <summary>
    /// Links to external resources for the drill
    /// </summary>
    public List<DrillLinkDto> Links { get; set; } = new();

    /// <summary>
    /// The scope type this drill belongs to (club, agegroup, team)
    /// </summary>
    public string ScopeType { get; set; } = string.Empty;

    /// <summary>
    /// Whether the drill is public/shared
    /// </summary>
    public bool IsPublic { get; set; }

    /// <summary>
    /// ID of the coach who created the drill
    /// </summary>
    public Guid? CreatedBy { get; set; }

    /// <summary>
    /// When the drill was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for drill link
/// </summary>
public class DrillLinkDto
{
    /// <summary>
    /// URL of the link
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Title/description of the link
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Type of link (youtube, instagram, tiktok, website, other)
    /// </summary>
    public string Type { get; set; } = string.Empty;
}
