using MediatR;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticById;

/// <summary>
/// Query to get a tactic by ID with full detail
/// </summary>
public record GetTacticByIdQuery(Guid TacticId) : IRequest<TacticDetailDto?>;
