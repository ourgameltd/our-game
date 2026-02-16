namespace OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;

/// <summary>
/// DTO for player detail context information.
/// Used to display player context in forms, settings pages, and detail views without requiring multiple API calls.
/// </summary>
public class PlayerDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string? Nickname { get; init; }
    public string? PhotoUrl { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public string? AssociationId { get; init; }
    public bool IsArchived { get; init; }
    public Guid? ClubId { get; init; }
    public string? ClubName { get; init; }

    /// <summary>Preferred positions as an array (e.g. ["CAM","CM"])</summary>
    public string[] PreferredPositions { get; init; } = Array.Empty<string>();

    /// <summary>All team IDs this player is assigned to</summary>
    public Guid[] TeamIds { get; init; } = Array.Empty<Guid>();

    /// <summary>All age group IDs derived from team assignments</summary>
    public Guid[] AgeGroupIds { get; init; } = Array.Empty<Guid>();

    /// <summary>Minimal team details for each assignment</summary>
    public TeamMinimalDto[] Teams { get; init; } = Array.Empty<TeamMinimalDto>();

    /// <summary>Emergency contacts for the player</summary>
    public EmergencyContactDto[]? EmergencyContacts { get; init; }

    // --- Medical & Physical Information ---

    /// <summary>Player allergies</summary>
    public string? Allergies { get; init; }
    /// <summary>Player medical conditions</summary>
    public string? MedicalConditions { get; init; }
    /// <summary>Height in cm (future field)</summary>
    public int? Height { get; init; }
    /// <summary>Weight in kg (future field)</summary>
    public int? Weight { get; init; }
    /// <summary>Preferred foot: Left, Right, Both (future field)</summary>
    public string? PreferredFoot { get; init; }

    // --- Performance Stats ---

    /// <summary>Overall rating (static evaluation)</summary>
    public int? OverallRating { get; init; }
    /// <summary>Average rating from performance ratings</summary>
    public double? AverageRating { get; init; }

    // --- Backward-compatible single-value fields (first assignment) ---

    /// <summary>First age group ID (kept for backward compatibility)</summary>
    public Guid? AgeGroupId { get; init; }
    /// <summary>First age group name (kept for backward compatibility)</summary>
    public string? AgeGroupName { get; init; }
    /// <summary>First team ID (kept for backward compatibility)</summary>
    public Guid? TeamId { get; init; }
    /// <summary>First team name (kept for backward compatibility)</summary>
    public string? TeamName { get; init; }
    /// <summary>Squad number for first team (kept for backward compatibility)</summary>
    public int? SquadNumber { get; init; }
    /// <summary>First preferred position (kept for backward compatibility)</summary>
    public string? PreferredPosition { get; init; }
}

/// <summary>
/// Minimal team information for player settings views
/// </summary>
public class TeamMinimalDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public Guid AgeGroupId { get; init; }
    public string? AgeGroupName { get; init; }
    public int? SquadNumber { get; init; }
}

/// <summary>
/// Emergency contact information for a player
/// </summary>
/// <param name="Name">Full name of the emergency contact</param>
/// <param name="Phone">Contact phone number</param>
/// <param name="Relationship">Relationship to the player (e.g., Parent, Guardian, Sibling)</param>
/// <param name="IsPrimary">Whether this is the primary emergency contact</param>
public record EmergencyContactDto(
    string Name,
    string Phone,
    string Relationship,
    bool IsPrimary
);
