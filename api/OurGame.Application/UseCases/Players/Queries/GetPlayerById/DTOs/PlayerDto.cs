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

    // --- Backward-compatible single-value fields (first assignment) ---

    /// <summary>First age group ID (kept for backward compatibility)</summary>
    public Guid? AgeGroupId { get; init; }
    /// <summary>First age group name (kept for backward compatibility)</summary>
    public string? AgeGroupName { get; init; }
    /// <summary>First team ID (kept for backward compatibility)</summary>
    public Guid? TeamId { get; init; }
    /// <summary>First team name (kept for backward compatibility)</summary>
    public string? TeamName { get; init; }
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
}
