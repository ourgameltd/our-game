using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Teams.Commands.AssignCoachToTeam.DTOs;

/// <summary>
/// Request DTO for assigning a coach to a team
/// </summary>
public record AssignCoachToTeamRequestDto
{
    /// <summary>
    /// The coach to assign to the team
    /// </summary>
    [Required]
    public Guid CoachId { get; init; }

    /// <summary>
    /// The role of the coach on this team (e.g., "headcoach", "assistantcoach", "goalkeepercoach", "fitnesscoach", "technicalcoach")
    /// </summary>
    [Required]
    public string Role { get; init; } = string.Empty;
}
