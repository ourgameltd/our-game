using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.AgeGroups.Commands.UpdateAgeGroup.DTOs;

/// <summary>
/// Request DTO for updating an existing age group.
/// </summary>
public record UpdateAgeGroupDto
{
    [Required]
    public Guid ClubId { get; init; }

    [Required]
    [StringLength(100)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Code { get; init; } = string.Empty;

    [Required]
    public string Level { get; init; } = string.Empty; // "youth", "amateur", "reserve", "senior"

    [Required]
    [StringLength(20)]
    public string Season { get; init; } = string.Empty;

    [Required]
    public int DefaultSquadSize { get; init; }

    [StringLength(500)]
    public string? Description { get; init; }
}
