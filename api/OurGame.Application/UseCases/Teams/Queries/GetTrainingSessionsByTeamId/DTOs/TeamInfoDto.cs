namespace OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId.DTOs;

/// <summary>
/// DTO for team information
/// </summary>
public record TeamInfoDto
{
    /// <summary>
    /// Unique identifier of the team
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Name of the team
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Indicates whether the team is archived
    /// </summary>
    public bool IsArchived { get; init; }

    /// <summary>
    /// Unique identifier of the age group
    /// </summary>
    public Guid AgeGroupId { get; init; }

    /// <summary>
    /// Name of the age group
    /// </summary>
    public string AgeGroupName { get; init; } = string.Empty;
}
