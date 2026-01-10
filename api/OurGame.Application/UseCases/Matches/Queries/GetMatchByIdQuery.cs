using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Matches.DTOs;

namespace OurGame.Application.UseCases.Matches.Queries;

/// <summary>
/// Query to get a match by ID
/// </summary>
public record GetMatchByIdQuery(Guid MatchId) : IQuery<MatchDto>;
