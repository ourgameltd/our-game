namespace OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;

/// <summary>
/// DTO for player detail context information.
/// Used to display player context in forms and pages without requiring multiple API calls.
/// </summary>
public class PlayerDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string? PhotoUrl { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public Guid? ClubId { get; init; }
    public string? ClubName { get; init; }
    public Guid? AgeGroupId { get; init; }
    public string? AgeGroupName { get; init; }
    public Guid? TeamId { get; init; }
    public string? TeamName { get; init; }
    public string? PreferredPosition { get; init; }
}
