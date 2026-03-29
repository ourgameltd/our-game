using MediatR;

namespace OurGame.Application.UseCases.Invites.Commands.RevokeInvite;

public record RevokeInviteCommand(Guid InviteId, string AuthId) : IRequest<bool>;
