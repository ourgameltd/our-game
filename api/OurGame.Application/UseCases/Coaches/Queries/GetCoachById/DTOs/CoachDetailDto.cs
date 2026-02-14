namespace OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;

/// <summary>
/// Full detail DTO for a single coach profile
/// </summary>
public class CoachDetailDto
{
    /// <summary>
    /// The unique identifier of the coach
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The coach's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// The coach's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// The coach's date of birth
    /// </summary>
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>
    /// URL to the coach's photo
    /// </summary>
    public string? PhotoUrl { get; set; }

    /// <summary>
    /// The coach's email address
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// The coach's phone number
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// The coach's football association ID
    /// </summary>
    public string? AssociationId { get; set; }

    /// <summary>
    /// Whether the coach has a linked user account
    /// </summary>
    public bool HasAccount { get; set; }

    /// <summary>
    /// The coach's role (e.g. HeadCoach, AssistantCoach)
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// The coach's biography
    /// </summary>
    public string? Biography { get; set; }

    /// <summary>
    /// The coach's areas of specialization
    /// </summary>
    public List<string> Specializations { get; set; } = new();

    /// <summary>
    /// Whether the coach has been archived
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// The ID of the club the coach belongs to
    /// </summary>
    public Guid ClubId { get; set; }

    /// <summary>
    /// The name of the club the coach belongs to
    /// </summary>
    public string ClubName { get; set; } = string.Empty;

    /// <summary>
    /// Teams the coach is assigned to
    /// </summary>
    public List<CoachTeamAssignmentDto> TeamAssignments { get; set; } = new();

    /// <summary>
    /// Age groups the coach coordinates
    /// </summary>
    public List<CoachAgeGroupCoordinatorDto> CoordinatorRoles { get; set; } = new();

    /// <summary>
    /// When the coach record was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the coach record was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
