using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Teams.DTOs;

namespace OurGame.Application.UseCases.Teams.Queries;

/// <summary>
/// Query to get team squad (players) with squad numbers
/// </summary>
public record GetTeamSquadQuery(Guid TeamId) : IQuery<List<TeamSquadPlayerDto>>;
