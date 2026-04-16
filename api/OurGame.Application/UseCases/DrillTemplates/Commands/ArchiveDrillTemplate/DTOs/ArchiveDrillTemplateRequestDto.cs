namespace OurGame.Application.UseCases.DrillTemplates.Commands.ArchiveDrillTemplate.DTOs;

/// <summary>
/// Request DTO for archiving or unarchiving a drill template.
/// </summary>
public record ArchiveDrillTemplateRequestDto
{
    /// <summary>
    /// Whether the drill template should be archived.
    /// </summary>
    public bool IsArchived { get; init; }
}
