using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole.DTOs;

/// <summary>
/// Request DTO for updating a team coach's role
/// </summary>
public record UpdateTeamCoachRoleRequestDto
{
    /// <summary>
    /// The new role for the coach on this team (e.g., "headcoach", "assistantcoach", "goalkeepercoach", "fitnesscoach", "technicalcoach")
    /// </summary>
    [Required]
    public string Role { get; init; } = string.Empty;
}
