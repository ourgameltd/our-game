using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.DrillTemplates.Commands.CreateDrillTemplate.DTOs;

/// <summary>
/// Request DTO for creating a new drill template
/// </summary>
public record CreateDrillTemplateRequestDto
{
    /// <summary>
    /// Template name
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Detailed description of the template
    /// </summary>
    [StringLength(4000)]
    public string? Description { get; init; }

    /// <summary>
    /// List of drill IDs in order
    /// </summary>
    [Required]
    public List<Guid> DrillIds { get; init; } = new();

    /// <summary>
    /// Whether the template is publicly accessible
    /// </summary>
    public bool IsPublic { get; init; }

    /// <summary>
    /// Scope assignment for this template (club, ageGroup, or team)
    /// </summary>
    [Required]
    public CreateDrillTemplateScopeDto Scope { get; init; } = new();
}

/// <summary>
/// Scope assignment for the drill template
/// </summary>
public record CreateDrillTemplateScopeDto
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
