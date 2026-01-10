using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Matches.DTOs;

namespace OurGame.Application.UseCases.Matches.Queries;

/// <summary>
/// Query to get match lineup
/// </summary>
public record GetMatchLineupQuery(Guid MatchId) : IQuery<MatchLineupDto>;
