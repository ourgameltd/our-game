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
    /// Player's contact email address.
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; init; } = string.Empty;

    /// <summary>
    /// Player's phone number.
    /// </summary>
    [Required]
    [StringLength(20)]
    public string PhoneNumber { get; init; } = string.Empty;

    /// <summary>
    /// Optional emergency contact details.
    /// </summary>
    [StringLength(500)]
    public string? EmergencyContact { get; init; }

    /// <summary>
    /// Preferred playing positions (e.g. ["GK", "CB", "CM"]).
    /// Stored as JSON in the database.
    /// </summary>
    [Required]
    public string[] PreferredPositions { get; init; } = Array.Empty<string>();

    /// <summary>
    /// Team IDs this player is assigned to.
    /// Used to update the PlayerTeams join table.
    /// </summary>
    [Required]
    public Guid[] TeamIds { get; init; } = Array.Empty<Guid>();

    /// <summary>
    /// Whether the player record is archived (soft-deleted).
    /// </summary>
    public bool IsArchived { get; init; }
}
