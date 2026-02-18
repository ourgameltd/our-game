namespace OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId.DTOs;

/// <summary>
/// DTO for team kits with team context
/// </summary>
public class TeamKitsDto
{
    /// <summary>
    /// Team identifier
    /// </summary>
    public Guid TeamId { get; set; }

    /// <summary>
    /// Team name
    /// </summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>
    /// Club identifier
    /// </summary>
    public Guid ClubId { get; set; }

    /// <summary>
    /// Club name
    /// </summary>
    public string ClubName { get; set; } = string.Empty;

    /// <summary>
    /// List of kits for the team
    /// </summary>
    public List<TeamKitDto> Kits { get; set; } = new();
}
