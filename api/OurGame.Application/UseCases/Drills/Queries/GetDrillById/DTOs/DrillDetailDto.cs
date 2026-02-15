namespace OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;

/// <summary>
/// Full detail DTO for a single drill
/// </summary>
public class DrillDetailDto
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
    /// Detailed description of the drill
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Duration of the drill in minutes
    /// </summary>
    public int? DurationMinutes { get; set; }

    /// <summary>
    /// Category of the drill (Technical, Tactical, Physical, Mental, Mixed)
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Attributes/skills trained in this drill
    /// </summary>
    public List<string> Attributes { get; set; } = new();

    /// <summary>
    /// Equipment required for the drill
    /// </summary>
    public List<string> Equipment { get; set; } = new();

    /// <summary>
    /// Step-by-step instructions for the drill
    /// </summary>
    public List<string> Instructions { get; set; } = new();

    /// <summary>
    /// Variations of the drill to increase/decrease difficulty
    /// </summary>
    public List<string> Variations { get; set; } = new();

    /// <summary>
    /// External links (videos, articles, etc.) related to the drill
    /// </summary>
    public List<DrillLinkDto> Links { get; set; } = new();

    /// <summary>
    /// Whether the drill is publicly accessible
    /// </summary>
    public bool IsPublic { get; set; }

    /// <summary>
    /// Coach ID who created the drill
    /// </summary>
    public Guid? CreatedBy { get; set; }

    /// <summary>
    /// When the drill was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the drill was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Scope configuration for clubs, age groups, and teams
    /// </summary>
    public DrillScopeDto Scope { get; set; } = new();
}

/// <summary>
/// External link associated with a drill
/// </summary>
public class DrillLinkDto
{
    /// <summary>
    /// Unique identifier for the link
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// URL of the link
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Title or description of the link
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Type of link (Youtube, Instagram, TikTok, Website, Other)
    /// </summary>
    public string LinkType { get; set; } = string.Empty;
}

/// <summary>
/// Scope configuration for drill visibility within clubs, age groups, and teams
/// </summary>
public class DrillScopeDto
{
    /// <summary>
    /// List of club IDs the drill is shared with
    /// </summary>
    public List<Guid> ClubIds { get; set; } = new();

    /// <summary>
    /// List of age group IDs the drill is shared with
    /// </summary>
    public List<Guid> AgeGroupIds { get; set; } = new();

    /// <summary>
    /// List of team IDs the drill is shared with
    /// </summary>
    public List<Guid> TeamIds { get; set; } = new();
}
