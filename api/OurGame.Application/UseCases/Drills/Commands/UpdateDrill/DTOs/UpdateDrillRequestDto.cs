using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Drills.Commands.UpdateDrill.DTOs;

/// <summary>
/// Request DTO for updating an existing drill.
/// Scope links cannot be changed (ignored if provided).
/// </summary>
public record UpdateDrillRequestDto
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
    [StringLength(2000)]
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
    /// List of player attributes this drill improves
    /// </summary>
    public List<string> Attributes { get; init; } = new();

    /// <summary>
    /// List of equipment needed for the drill
    /// </summary>
    public List<string> Equipment { get; init; } = new();

    /// <summary>
    /// Step-by-step instructions for the drill
    /// </summary>
    public List<string> Instructions { get; init; } = new();

    /// <summary>
    /// Optional variations of the drill
    /// </summary>
    public List<string> Variations { get; init; } = new();

    /// <summary>
    /// Links to external resources for the drill
    /// </summary>
    public List<UpdateDrillLinkDto> Links { get; init; } = new();

    /// <summary>
    /// Whether the drill is public/shared
    /// </summary>
    public bool IsPublic { get; init; }
}

/// <summary>
/// Link to external resource for the drill
/// </summary>
public record UpdateDrillLinkDto
{
    /// <summary>
    /// URL of the link
    /// </summary>
    [Required]
    [StringLength(500)]
    public string Url { get; init; } = string.Empty;

    /// <summary>
    /// Title/description of the link
    /// </summary>
    [StringLength(200)]
    public string? Title { get; init; }

    /// <summary>
    /// Type of link (youtube, instagram, tiktok, website, other)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Type { get; init; } = string.Empty;
}
