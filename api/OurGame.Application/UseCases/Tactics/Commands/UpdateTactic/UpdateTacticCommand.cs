using MediatR;
using OurGame.Application.UseCases.Tactics.Commands.UpdateTactic.DTOs;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

namespace OurGame.Application.UseCases.Tactics.Commands.UpdateTactic;

/// <summary>
/// Command to update an existing tactic (replace strategy for overrides and principles)
/// </summary>
public record UpdateTacticCommand(Guid TacticId, UpdateTacticRequestDto Dto) : IRequest<TacticDetailDto>;
