namespace OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId.DTOs;

/// <summary>
/// DTO for team training sessions response
/// </summary>
public record TeamTrainingSessionsDto
{
    /// <summary>
    /// Team information
    /// </summary>
    public TeamInfoDto Team { get; init; } = new();

    /// <summary>
    /// Club information
    /// </summary>
    public ClubInfoDto Club { get; init; } = new();

    /// <summary>
    /// List of training sessions for the team
    /// </summary>
    public List<TeamTrainingSessionDto> Sessions { get; init; } = new();

    /// <summary>
    /// Total count of sessions
    /// </summary>
    public int TotalCount { get; init; }
}
