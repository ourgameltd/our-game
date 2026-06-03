namespace OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;

/// <summary>
/// DTO representing a team assignment for a coach
/// </summary>
public class CoachTeamAssignmentDto
{
    /// <summary>
    /// The unique identifier of the team
    /// </summary>
    public Guid TeamId { get; set; }

    /// <summary>
    /// The team name
    /// </summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>
    /// The unique identifier of the age group the team belongs to
    /// </summary>
    public Guid AgeGroupId { get; set; }

    /// <summary>
    /// The name of the age group the team belongs to
    /// </summary>
    public string AgeGroupName { get; set; } = string.Empty;

    /// <summary>
    /// Whether this coach is the primary coach for this team
    /// </summary>
    public bool IsPrimary { get; set; }
}
