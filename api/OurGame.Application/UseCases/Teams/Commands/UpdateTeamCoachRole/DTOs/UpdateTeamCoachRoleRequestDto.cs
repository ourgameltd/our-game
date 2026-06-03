using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole.DTOs;

/// <summary>
/// Request DTO for updating a coach's primary status on a team
/// </summary>
public record UpdateTeamCoachRoleRequestDto
{
    /// <summary>
    /// Whether this coach is the primary coach for this team
    /// </summary>
    public bool IsPrimary { get; init; } = false;
}
