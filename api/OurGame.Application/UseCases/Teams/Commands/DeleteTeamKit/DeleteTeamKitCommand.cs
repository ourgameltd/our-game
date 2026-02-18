using MediatR;

namespace OurGame.Application.UseCases.Teams.Commands.DeleteTeamKit;

/// <summary>
/// Command to delete an existing team kit.
/// </summary>
public record DeleteTeamKitCommand(Guid TeamId, Guid KitId) : IRequest;
