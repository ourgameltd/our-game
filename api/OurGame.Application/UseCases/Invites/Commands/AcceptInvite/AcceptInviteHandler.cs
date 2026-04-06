using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Invites.Commands.AcceptInvite.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Invites.Commands.AcceptInvite;

/// <summary>
/// Handler for accepting an invite and linking the authenticated user's identity to the correct domain record.
/// </summary>
public class AcceptInviteHandler : IRequestHandler<AcceptInviteCommand, AcceptInviteResultDto>
{
    private readonly OurGameContext _db;

    public AcceptInviteHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<AcceptInviteResultDto> Handle(AcceptInviteCommand command, CancellationToken cancellationToken)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // 1. Find invite by code where Status == Pending and not expired
            var invite = await _db.Invites
                .FirstOrDefaultAsync(i => i.Code == command.Code
                                          && i.Status == InviteStatus.Pending
                                          && i.ExpiresAt > DateTime.UtcNow,
                    cancellationToken);

            if (invite == null)
            {
                // Check if invite exists at all to give a better error message
                var anyInvite = await _db.Invites
                    .FirstOrDefaultAsync(i => i.Code == command.Code, cancellationToken);

                if (anyInvite == null)
                    throw new NotFoundException("Invite", command.Code);

                if (anyInvite.Status == InviteStatus.Accepted)
                    throw new ValidationException(new Dictionary<string, string[]>
                    {
                        ["Code"] = new[] { "This invite has already been accepted." }
                    });

                if (anyInvite.Status == InviteStatus.Revoked)
                    throw new ValidationException(new Dictionary<string, string[]>
                    {
                        ["Code"] = new[] { "This invite has been revoked." }
                    });

                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["Code"] = new[] { "This invite has expired." }
                });
            }

            // 2. Validate authenticated user's email matches Invite.Email (case-insensitive)
            if (!string.Equals(invite.Email, command.Email, StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["Email"] = new[] { "Your account email does not match the invite email." }
                });
            }

            // 3. Find or create User by AuthId
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.AuthId == command.AuthId, cancellationToken);

            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    AuthId = command.AuthId,
                    Email = command.Email.ToLowerInvariant(),
                    FirstName = command.FirstName,
                    LastName = command.LastName,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _db.Users.Add(user);
                await _db.SaveChangesAsync(cancellationToken);
            }

            // 4. Link entity based on invite type
            switch (invite.Type)
            {
                case InviteType.Coach:
                    await LinkCoachAsync(invite.EntityId, user.Id, cancellationToken);
                    break;

                case InviteType.Player:
                    await LinkPlayerAsync(invite.EntityId, user.Id, cancellationToken);
                    break;

                case InviteType.Parent:
                    await LinkParentAsync(invite.EntityId, user.Id, cancellationToken);
                    break;
            }

            // 5. Mark invite as accepted
            invite.Status = InviteStatus.Accepted;
            invite.AcceptedByUserId = user.Id;
            invite.AcceptedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return new AcceptInviteResultDto
            {
                InviteId = invite.Id,
                Message = "Invite accepted successfully. Your account has been linked."
            };
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task LinkCoachAsync(Guid coachId, Guid userId, CancellationToken cancellationToken)
    {
        var coach = await _db.Coaches
            .FirstOrDefaultAsync(c => c.Id == coachId, cancellationToken);

        if (coach == null)
            throw new NotFoundException("Coach", coachId);

        coach.UserId = userId;
        coach.HasAccount = true;
    }

    private async Task LinkPlayerAsync(Guid playerId, Guid userId, CancellationToken cancellationToken)
    {
        var player = await _db.Players
            .FirstOrDefaultAsync(p => p.Id == playerId, cancellationToken);

        if (player == null)
            throw new NotFoundException("Player", playerId);

        player.UserId = userId;
    }

    private async Task LinkParentAsync(Guid playerId, Guid parentUserId, CancellationToken cancellationToken)
    {
        // Check if this user is already linked to this player as an emergency contact
        var alreadyLinked = await _db.EmergencyContacts
            .AnyAsync(ec => ec.PlayerId == playerId && ec.UserId == parentUserId, cancellationToken);

        if (alreadyLinked)
            return;

        // Find the user so we can match against existing unlinked emergency contact records
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == parentUserId, cancellationToken);

        // Try to find an existing unlinked emergency contact for this player by name match
        EmergencyContact? existingContact = null;
        var fullName = $"{user?.FirstName} {user?.LastName}".Trim();
        if (user != null && !string.IsNullOrWhiteSpace(user.FirstName))
        {
            existingContact = await _db.EmergencyContacts
                .FirstOrDefaultAsync(ec => ec.PlayerId == playerId
                                           && ec.UserId == null
                                           && ec.Name.ToLower() == fullName.ToLower(),
                    cancellationToken);
        }

        if (existingContact != null)
        {
            // Link the existing emergency contact record to the newly registered user
            existingContact.UserId = parentUserId;
        }
        else
        {
            // No pre-existing emergency contact record — create a new one
            _db.EmergencyContacts.Add(new EmergencyContact
            {
                Id = Guid.NewGuid(),
                PlayerId = playerId,
                UserId = parentUserId,
                Name = fullName,
                Relationship = "Parent",
                IsPrimary = false
            });
        }
    }
}
