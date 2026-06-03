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
    /// Whether this coach is the primary coach for this team
    /// </summary>
    public bool IsPrimary { get; init; } = false;
}
