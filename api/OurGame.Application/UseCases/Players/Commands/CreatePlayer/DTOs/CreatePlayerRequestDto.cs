using System.ComponentModel.DataAnnotations;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerById.DTOs;

namespace OurGame.Application.UseCases.Players.Commands.CreatePlayer.DTOs;

/// <summary>
/// Request DTO for creating a new player within a club.
/// </summary>
public record CreatePlayerRequestDto
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; init; } = string.Empty;

    [StringLength(100)]
    public string? Nickname { get; init; }

    [StringLength(50)]
    public string? AssociationId { get; init; }

    [Required]
    public DateOnly DateOfBirth { get; init; }

    public string? Photo { get; init; }

    [StringLength(1000)]
    public string? Allergies { get; init; }

    [StringLength(1000)]
    public string? MedicalConditions { get; init; }

    public EmergencyContactRequestDto[]? EmergencyContacts { get; init; }

    [Required]
    public string[] PreferredPositions { get; init; } = Array.Empty<string>();

    public Guid[]? TeamIds { get; init; }
}