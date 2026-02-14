using MediatR;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerById.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;

namespace OurGame.Application.UseCases.Players.Commands.UpdatePlayerById;

/// <summary>
/// Command to update an existing player's settings.
/// </summary>
public record UpdatePlayerCommand(Guid PlayerId, UpdatePlayerRequestDto Dto) : IRequest<PlayerDto>;
