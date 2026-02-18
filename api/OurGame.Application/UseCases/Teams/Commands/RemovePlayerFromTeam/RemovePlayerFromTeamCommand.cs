using MediatR;
using OurGame.Application.Abstractions.Responses;

namespace OurGame.Application.UseCases.Teams.Commands.RemovePlayerFromTeam;

/// <summary>
/// Command to remove a player from a team
/// </summary>
public record RemovePlayerFromTeamCommand(Guid TeamId, Guid PlayerId, string UserId) : IRequest<Result>;
