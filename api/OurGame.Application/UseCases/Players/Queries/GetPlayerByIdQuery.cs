using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Players.DTOs;

namespace OurGame.Application.UseCases.Players.Queries;

/// <summary>
/// Query to get a player by ID with profile information
/// </summary>
public record GetPlayerByIdQuery(Guid PlayerId) : IQuery<PlayerProfileDto>;
