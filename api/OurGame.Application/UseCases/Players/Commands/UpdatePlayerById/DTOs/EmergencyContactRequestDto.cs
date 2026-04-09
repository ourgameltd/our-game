using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Players.Commands.UpdatePlayerById.DTOs;

/// <summary>
/// Request DTO for an emergency contact entry.
/// Used when updating a player's emergency contacts.
/// </summary>
public record EmergencyContactRequestDto
{
    /// <summary>
    /// Full name of the emergency contact person.
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Contact phone number.
    /// </summary>
    [StringLength(20)]
    public string? Phone { get; init; }

    /// <summary>
    /// Contact email address.
    /// </summary>
    [EmailAddress]
    [StringLength(255)]
    public string? Email { get; init; }

    /// <summary>
    /// Relationship to the player (e.g., "Parent", "Guardian", "Spouse").
    /// </summary>
    [StringLength(100)]
    public string? Relationship { get; init; }

    /// <summary>
    /// Whether this is the primary emergency contact.
    /// Server enforces exactly one primary contact.
    /// </summary>
    public bool IsPrimary { get; init; }
}
