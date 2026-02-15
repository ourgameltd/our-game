using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Drills.Commands.CreateDrill.DTOs;

/// <summary>
/// Request DTO for creating a new drill
/// </summary>
public record CreateDrillRequestDto
{
    /// <summary>
    /// Drill name
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Detailed description of the drill
    /// </summary>
    [StringLength(4000)]
    public string? Description { get; init; }

    /// <summary>
    /// Duration of the drill in minutes
    /// </summary>
    [Range(1, 300)]
    public int? DurationMinutes { get; init; }

    /// <summary>
    /// Category of the drill (technical, tactical, physical, mental, mixed)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Category { get; init; } = string.Empty;

    /// <summary>
    /// List of attributes/skills trained in this drill
    /// </summary>
    public List<string> Attributes { get; init; } = new();

    /// <summary>
    /// List of equipment required for the drill
    /// </summary>
    public List<string> Equipment { get; init; } = new();

    /// <summary>
    /// Step-by-step instructions for the drill
    /// </summary>
    public List<string> Instructions { get; init; } = new();

    /// <summary>
    /// Variations of the drill
    /// </summary>
    public List<string> Variations { get; init; } = new();

    /// <summary>
    /// External links for the drill (videos, articles, etc.)
    /// </summary>
    public List<CreateDrillLinkDto> Links { get; init; } = new();

    /// <summary>
    /// Whether the drill is publicly accessible
    /// </summary>
    public bool IsPublic { get; init; }

    /// <summary>
    /// Scope assignment for this drill (club, ageGroup, or team)
    /// </summary>
    [Required]
    public CreateDrillScopeDto Scope { get; init; } = new();
}

/// <summary>
/// Scope assignment for the drill
/// </summary>
public record CreateDrillScopeDto
{
    /// <summary>
    /// Club ID (required for all scope types)
    /// </summary>
    public Guid? ClubId { get; init; }

    /// <summary>
    /// Age group ID (required when sharing at age group level)
    /// </summary>
    public Guid? AgeGroupId { get; init; }

    /// <summary>
    /// Team ID (required when sharing at team level)
    /// </summary>
    public Guid? TeamId { get; init; }
}

/// <summary>
/// External link for a drill
/// </summary>
public record CreateDrillLinkDto
{
    /// <summary>
    /// URL of the link
    /// </summary>
    [Required]
    [StringLength(2000)]
    public string Url { get; init; } = string.Empty;

    /// <summary>
    /// Title or description of the link
    /// </summary>
    [StringLength(200)]
    public string? Title { get; init; }

    /// <summary>
    /// Type of link (youtube, instagram, tiktok, website, other)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string LinkType { get; init; } = string.Empty;
}
