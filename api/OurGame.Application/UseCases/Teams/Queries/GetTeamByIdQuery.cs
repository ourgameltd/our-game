using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.Teams.DTOs;

namespace OurGame.Application.UseCases.Teams.Queries;

/// <summary>
/// Query to get a team by ID with detailed information
/// </summary>
public record GetTeamByIdQuery(Guid TeamId) : IQuery<TeamDetailDto>;
