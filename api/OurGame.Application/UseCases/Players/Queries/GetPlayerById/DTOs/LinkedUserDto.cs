namespace OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;

/// <summary>
/// DTO for the user account directly linked to a player via the invite system.
/// Represents the player's own user account (Player.UserId), as opposed to
/// <see cref="LinkedAccountDto"/> which represents parent/guardian links via emergency contacts.
/// </summary>
public record LinkedUserDto
{
    /// <summary>User account ID</summary>
    public Guid Id { get; init; }

    /// <summary>First name of the linked user</summary>
    public string FirstName { get; init; } = string.Empty;

    /// <summary>Last name of the linked user</summary>
    public string LastName { get; init; } = string.Empty;

    /// <summary>Email address of the linked user</summary>
    public string? Email { get; init; }

    /// <summary>Photo URL of the linked user</summary>
    public string? PhotoUrl { get; init; }
}
