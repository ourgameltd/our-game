using MediatR;
using OurGame.Application.UseCases.Tactics.Commands.CreateTactic.DTOs;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

namespace OurGame.Application.UseCases.Tactics.Commands.CreateTactic;

/// <summary>
/// Command to create a new tactic with scope, position overrides, and principles
/// </summary>
public record CreateTacticCommand(CreateTacticRequestDto Dto) : IRequest<TacticDetailDto>;
