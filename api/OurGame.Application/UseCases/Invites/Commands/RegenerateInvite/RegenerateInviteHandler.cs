using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Invites.Commands.CreateInvite.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Invites.Commands.RegenerateInvite;

/// <summary>
/// Atomically revokes an existing pending invite and creates a replacement with a new code.
/// </summary>
public class RegenerateInviteHandler : IRequestHandler<RegenerateInviteCommand, InviteDto>
{
    private readonly OurGameContext _db;

    public RegenerateInviteHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<InviteDto> Handle(RegenerateInviteCommand command, CancellationToken cancellationToken)
    {
        var oldInvite = await _db.Invites
            .Include(i => i.Club)
            .FirstOrDefaultAsync(i => i.Id == command.InviteId, cancellationToken);

        if (oldInvite == null)
            throw new NotFoundException("Invite", command.InviteId);

        if (oldInvite.Status != InviteStatus.Pending)
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Status"] = new[] { "Only pending invites can be regenerated." }
            });

        var creatingUser = await _db.Users
            .FirstOrDefaultAsync(u => u.AuthId == command.AuthId, cancellationToken);

        if (creatingUser == null)
            throw new NotFoundException("User", command.AuthId);

        // Revoke old invite
        oldInvite.Status = InviteStatus.Revoked;

        // Create replacement
        var newInvite = new Invite
        {
            Id = Guid.NewGuid(),
            Code = InviteConstants.GenerateCode(),
            Email = oldInvite.Email,
            Type = oldInvite.Type,
            EntityId = oldInvite.EntityId,
            ClubId = oldInvite.ClubId,
            Status = InviteStatus.Pending,
            CreatedByUserId = creatingUser.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(InviteConstants.InviteExpiryDays)
        };

        _db.Invites.Add(newInvite);
        await _db.SaveChangesAsync(cancellationToken);

        var isOpenInvite = InviteConstants.IsOpenInviteEmail(newInvite.Email);

        return new InviteDto
        {
            Id = newInvite.Id,
            Code = newInvite.Code,
            Email = newInvite.Email,
            Type = newInvite.Type,
            EntityId = newInvite.EntityId,
            ClubId = newInvite.ClubId,
            ClubName = oldInvite.Club?.Name ?? string.Empty,
            Status = newInvite.Status,
            CreatedAt = newInvite.CreatedAt,
            ExpiresAt = newInvite.ExpiresAt,
            IsOpenInvite = isOpenInvite
        };
    }
}
