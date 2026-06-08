namespace OurGame.Application.UseCases.Drills.Commands.ArchiveDrill.DTOs;

/// <summary>
/// Request DTO for archiving or unarchiving a drill.
/// </summary>
public record ArchiveDrillRequestDto
{
    /// <summary>
    /// Whether the drill should be archived.
    /// </summary>
    public bool IsArchived { get; init; }
}
