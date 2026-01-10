using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.DTOs;

namespace OurGame.Application.UseCases.Players.Queries;

/// <summary>
/// Query to get player attributes (35 EA FC-style attributes)
/// </summary>
public record GetPlayerAttributesQuery(Guid PlayerId) : IQuery<PlayerAttributesDto>;
