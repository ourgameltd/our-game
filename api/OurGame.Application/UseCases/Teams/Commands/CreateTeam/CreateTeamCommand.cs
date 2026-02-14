using MediatR;
using OurGame.Application.UseCases.Teams.Commands.CreateTeam.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;

namespace OurGame.Application.UseCases.Teams.Commands.CreateTeam;

/// <summary>
/// Command to create a new team.
/// </summary>
public record CreateTeamCommand(CreateTeamRequest Dto) : IRequest<TeamOverviewTeamDto>;
