namespace OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;

/// <summary>
/// DTO for a linked parent/guardian from the PlayerParent table.
/// Represents users who have been linked to a player via the invite system.
/// </summary>
public record LinkedParentDto
{
    /// <summary>Unique identifier for the PlayerParent record</summary>
    public Guid Id { get; init; }

    /// <summary>First name of the parent</summary>
    public string FirstName { get; init; } = string.Empty;

    /// <summary>Last name of the parent</summary>
    public string LastName { get; init; } = string.Empty;

    /// <summary>Email address of the parent</summary>
    public string? Email { get; init; }

    /// <summary>Phone number of the parent</summary>
    public string? Phone { get; init; }

    /// <summary>Whether the parent has a linked user account</summary>
    public bool IsLinked { get; init; }
}
