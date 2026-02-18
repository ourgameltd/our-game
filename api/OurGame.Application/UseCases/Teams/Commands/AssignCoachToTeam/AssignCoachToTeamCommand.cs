using MediatR;
using OurGame.Application.UseCases.Teams.Commands.AssignCoachToTeam.DTOs;
using TeamCoachDto = OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs.TeamCoachDto;

namespace OurGame.Application.UseCases.Teams.Commands.AssignCoachToTeam;

/// <summary>
/// Command to assign a coach to a team with a specific role
/// </summary>
public record AssignCoachToTeamCommand(Guid TeamId, AssignCoachToTeamRequestDto Dto) : IRequest<TeamCoachDto>;
