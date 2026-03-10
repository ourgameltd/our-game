using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.AgeGroups.Commands.ArchiveAgeGroup.DTOs;

/// <summary>
/// Request DTO for archiving or unarchiving an age group.
/// </summary>
public record ArchiveAgeGroupRequestDto
{
    /// <summary>
    /// Whether the age group should be archived (true) or unarchived (false).
    /// </summary>
    [Required]
    public bool IsArchived { get; init; }
}
