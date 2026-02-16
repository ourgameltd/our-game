namespace OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;

/// <summary>
/// DTO for emergency contact information associated with a player.
/// Used to display emergency contact details in player settings and detail views.
/// </summary>
public record EmergencyContactDto
{
    /// <summary>Unique identifier for the emergency contact</summary>
    public Guid Id { get; init; }

    /// <summary>Full name of the emergency contact</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Phone number for the emergency contact</summary>
    public string Phone { get; init; } = string.Empty;

    /// <summary>Relationship to the player (e.g., Mother, Father, Guardian)</summary>
    public string Relationship { get; init; } = string.Empty;

    /// <summary>Indicates if this is the primary emergency contact</summary>
    public bool IsPrimary { get; init; }
}
