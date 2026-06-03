namespace OurGame.Application.UseCases.Coaches.DTOs;

/// <summary>
/// Represents a coach's role assignment within an age group
/// </summary>
public record AgeGroupRoleDto
{
    /// <summary>
    /// The age group ID
    /// </summary>
    public Guid AgeGroupId { get; init; }

    /// <summary>
    /// The coaching role (e.g. HeadCoach, AssistantCoach, GoalkeeperCoach, FitnessCoach, TechnicalCoach)
    /// </summary>
    public string Role { get; init; } = string.Empty;
}
