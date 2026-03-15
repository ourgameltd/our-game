using MediatR;

namespace OurGame.Application.UseCases.Clubs.Commands.DeleteClubKit;

/// <summary>
/// Command to delete an existing club kit.
/// </summary>
public record DeleteClubKitCommand(Guid ClubId, Guid KitId) : IRequest;