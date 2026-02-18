using MediatR;
using OurGame.Application.UseCases.Teams.Commands.CreateTeamKit.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId.DTOs;

namespace OurGame.Application.UseCases.Teams.Commands.CreateTeamKit;

/// <summary>
/// Command to create a new team kit.
/// </summary>
public record CreateTeamKitCommand(Guid TeamId, CreateTeamKitRequestDto Dto) : IRequest<TeamKitDto>;
