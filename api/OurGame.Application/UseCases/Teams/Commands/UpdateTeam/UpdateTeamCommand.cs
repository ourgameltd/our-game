using MediatR;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeam.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeam;

/// <summary>
/// Command to update an existing team.
/// </summary>
public record UpdateTeamCommand(Guid TeamId, UpdateTeamRequestDto Dto) : IRequest<TeamOverviewTeamDto>;
