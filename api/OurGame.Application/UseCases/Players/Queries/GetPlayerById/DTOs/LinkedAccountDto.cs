namespace OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;

/// <summary>
/// DTO for a linked user account associated with a player or coach via the emergency contacts table.
/// Represents users who have been linked to an entity via the invite system.
/// </summary>
public record LinkedAccountDto
{
    /// <summary>Unique identifier for the EmergencyContact record</summary>
    public Guid Id { get; init; }

    /// <summary>First name of the linked account holder</summary>
    public string FirstName { get; init; } = string.Empty;

    /// <summary>Last name of the linked account holder</summary>
    public string LastName { get; init; } = string.Empty;

    /// <summary>Email address of the linked account holder</summary>
    public string? Email { get; init; }

    /// <summary>Phone number of the linked account holder</summary>
    public string? Phone { get; init; }

    /// <summary>Whether the account holder has a linked user account</summary>
    public bool IsLinked { get; init; }
}
