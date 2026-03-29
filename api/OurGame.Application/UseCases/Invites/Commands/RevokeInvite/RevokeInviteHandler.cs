using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Invites.Commands.RevokeInvite;

/// <summary>
/// Handler for revoking a pending invite.
/// </summary>
public class RevokeInviteHandler : IRequestHandler<RevokeInviteCommand, bool>
{
    private readonly OurGameContext _db;

    public RevokeInviteHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<bool> Handle(RevokeInviteCommand command, CancellationToken cancellationToken)
    {
        var invite = await _db.Invites
            .FirstOrDefaultAsync(i => i.Id == command.InviteId, cancellationToken);

        if (invite == null)
            throw new NotFoundException("Invite", command.InviteId);

        if (invite.Status != InviteStatus.Pending)
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Status"] = new[] { "Only pending invites can be revoked." }
            });

        invite.Status = InviteStatus.Revoked;
        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }
}
