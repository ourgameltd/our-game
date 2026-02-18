using MediatR;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamKit.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId.DTOs;

namespace OurGame.Application.UseCases.Teams.Commands.UpdateTeamKit;

/// <summary>
/// Command to update an existing team kit.
/// </summary>
public record UpdateTeamKitCommand(Guid TeamId, Guid KitId, UpdateTeamKitRequestDto Dto) : IRequest<TeamKitDto>;
