using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.DrillTemplates.Commands.UpdateDrillTemplate.DTOs;

/// <summary>
/// Request DTO for updating an existing drill template.
/// Scope links cannot be changed after creation.
/// </summary>
public record UpdateDrillTemplateRequestDto
{
    /// <summary>
    /// Name of the drill template
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Description of the drill template
    /// </summary>
    [StringLength(2000)]
    public string? Description { get; init; }

    /// <summary>
    /// Ordered list of drill IDs included in the template
    /// </summary>
    [Required]
    public List<Guid> DrillIds { get; init; } = new();

    /// <summary>
    /// Whether the template is public/shared
    /// </summary>
    public bool IsPublic { get; init; }
}
