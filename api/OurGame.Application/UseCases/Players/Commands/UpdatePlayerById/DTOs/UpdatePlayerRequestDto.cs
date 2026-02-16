using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Players.Commands.UpdatePlayerById.DTOs;

/// <summary>
/// Request DTO for updating an existing player's settings.
/// Contains all mutable fields for a full PUT update.
/// </summary>
public record UpdatePlayerRequestDto
{
    /// <summary>
    /// Player's first name.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string FirstName { get; init; } = string.Empty;

    /// <summary>
    /// Player's last name.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string LastName { get; init; } = string.Empty;

    /// <summary>
    /// Optional nickname / display name.
    /// </summary>
    [StringLength(100)]
    public string? Nickname { get; init; }

    /// <summary>
    /// Optional association registration ID (e.g. FAI number).
    /// </summary>
    [StringLength(50)]
    public string? AssociationId { get; init; }

    /// <summary>
    /// Player's date of birth.
    /// </summary>
    [Required]
    public DateOnly DateOfBirth { get; init; }

    /// <summary>
    /// Optional URL or path to the player's profile photo.
    /// </summary>
    [StringLength(500)]
    public string? Photo { get; init; }

    /// <summary>
    /// Optional allergies information.
    /// </summary>
    [StringLength(1000)]
    public string? Allergies { get; init; }

    /// <summary>
    /// Optional medical conditions information.
    /// </summary>
    [StringLength(1000)]
    public string? MedicalConditions { get; init; }

    /// <summary>
    /// List of emergency contacts for the player.
    /// Server enforces exactly one primary contact.
    /// </summary>
    public EmergencyContactRequestDto[]? EmergencyContacts { get; init; }

    /// <summary>
    /// Preferred playing positions (e.g. ["GK", "CB", "CM"]).
    /// Stored as JSON in the database.
    /// </summary>
    [Required]
    public string[] PreferredPositions { get; init; } = Array.Empty<string>();

    /// <summary>
    /// Team IDs this player is assigned to.
    /// Used to update the PlayerTeams join table.
    /// Only updates team assignments if provided (not null).
    /// </summary>
    public Guid[]? TeamIds { get; init; }

    /// <summary>
    /// Whether the player record is archived (soft-deleted).
    /// </summary>
    public bool IsArchived { get; init; }
}
