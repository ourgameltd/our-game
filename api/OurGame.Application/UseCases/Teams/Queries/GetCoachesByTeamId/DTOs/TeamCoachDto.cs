namespace OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs;

/// <summary>
/// DTO representing a coach assigned to a team
/// </summary>
public class TeamCoachDto
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
    /// URL to the coach's photo
    /// </summary>
    public string? PhotoUrl { get; set; }

    /// <summary>
    /// The coach's role (e.g. HeadCoach, AssistantCoach, GoalkeeperCoach)
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Whether the coach has been archived
    /// </summary>
    public bool IsArchived { get; set; }
}
