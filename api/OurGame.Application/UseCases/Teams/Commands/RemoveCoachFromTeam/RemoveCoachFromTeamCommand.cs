using MediatR;

namespace OurGame.Application.UseCases.Teams.Commands.RemoveCoachFromTeam;

/// <summary>
/// Command to remove a coach from a team
/// </summary>
public record RemoveCoachFromTeamCommand(Guid TeamId, Guid CoachId) : IRequest;
