namespace OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId.DTOs;

/// <summary>
/// DTO containing team metadata
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
}
