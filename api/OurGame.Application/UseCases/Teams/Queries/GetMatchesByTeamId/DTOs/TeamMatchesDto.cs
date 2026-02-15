namespace OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId.DTOs;

/// <summary>
/// Response DTO containing team matches with team and club information
/// </summary>
public record TeamMatchesDto
{
    /// <summary>
    /// Team information
    /// </summary>
    public TeamInfoDto Team { get; init; } = null!;

    /// <summary>
    /// Club information
    /// </summary>
    public ClubInfoDto Club { get; init; } = null!;

    /// <summary>
    /// List of matches for the team
    /// </summary>
    public List<TeamMatchDto> Matches { get; init; } = new();

    /// <summary>
    /// Total count of matches
    /// </summary>
    public int TotalCount { get; init; }
}
