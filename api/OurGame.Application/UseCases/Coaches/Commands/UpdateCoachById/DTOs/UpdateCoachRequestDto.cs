using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Coaches.Commands.UpdateCoachById.DTOs;

/// <summary>
/// Request DTO for updating an existing coach's profile.
/// Contains all mutable fields for a full PUT update.
/// </summary>
public record UpdateCoachRequestDto
{
    /// <summary>
    /// Coach's first name.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string FirstName { get; init; } = string.Empty;

    /// <summary>
    /// Coach's last name.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string LastName { get; init; } = string.Empty;

    /// <summary>
    /// Coach's phone number.
    /// </summary>
    [StringLength(20)]
    public string? Phone { get; init; }

    /// <summary>
    /// Coach's date of birth.
    /// </summary>
    public DateOnly? DateOfBirth { get; init; }

    /// <summary>
    /// Optional football association registration ID (e.g. FAI number).
    /// </summary>
    [StringLength(50)]
    public string? AssociationId { get; init; }

    /// <summary>
    /// Coach's role (e.g. HeadCoach, AssistantCoach, GoalkeeperCoach, FitnessCoach, TechnicalCoach).
    /// Must match a valid CoachRole enum value.
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Role { get; init; } = string.Empty;

    /// <summary>
    /// Coach's biography / about section.
    /// </summary>
    [StringLength(2000)]
    public string? Biography { get; init; }

    /// <summary>
    /// Coach's areas of specialization (e.g. ["Goalkeeping", "Set Pieces", "Youth Development"]).
    /// Stored as a comma-separated string in the database.
    /// </summary>
    public string[] Specializations { get; init; } = Array.Empty<string>();

    /// <summary>
    /// Team IDs this coach is assigned to.
    /// Used to update the TeamCoaches join table.
    /// </summary>
    public Guid[] TeamIds { get; init; } = Array.Empty<Guid>();

    /// <summary>
    /// URL or base64 string for the coach's photo.
    /// </summary>
    [StringLength(2000)]
    public string? Photo { get; init; }
}
