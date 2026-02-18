using MediatR;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole.DTOs;
using TeamCoachDto = OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs.TeamCoachDto;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole;

/// <summary>
/// Command to update the role of a coach on a team
/// </summary>
public record UpdateTeamCoachRoleCommand(Guid TeamId, Guid CoachId, UpdateTeamCoachRoleRequestDto Dto) : IRequest<TeamCoachDto>;
