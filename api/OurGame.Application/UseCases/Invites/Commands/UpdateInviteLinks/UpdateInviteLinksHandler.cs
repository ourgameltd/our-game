using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Invites;
using OurGame.Application.UseCases.Invites.Commands.AcceptInvite.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Invites.Commands.UpdateInviteLinks;

public class UpdateInviteLinksHandler : IRequestHandler<UpdateInviteLinksCommand, AcceptInviteResultDto>
{
    private readonly OurGameContext _db;

    public UpdateInviteLinksHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<AcceptInviteResultDto> Handle(UpdateInviteLinksCommand command, CancellationToken cancellationToken)
    {
        var invite = await _db.Invites
            .FirstOrDefaultAsync(i => i.Code == command.Code
                                      && i.Status == InviteStatus.Pending
                                      && i.ExpiresAt > DateTime.UtcNow,
                cancellationToken);

        if (invite == null)
        {
            throw new NotFoundException("Invite", command.Code);
        }

        if (!InviteConstants.IsOpenInviteEmail(invite.Email))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Code"] = new[] { "This invite does not support self-service linking." }
            });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.AuthId == command.AuthId, cancellationToken);
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

        var selected = command.Request.SelectedEntityIds.Distinct().ToList();

        switch (invite.Type)
        {
            case InviteType.Player:
                await UpdatePlayerLinkAsync(invite.EntityId, user.Id, selected, cancellationToken);
                break;
            case InviteType.Coach:
                await UpdateCoachLinkAsync(invite.EntityId, user.Id, selected, cancellationToken);
                break;
            case InviteType.Parent:
                await UpdateParentLinksAsync(invite.EntityId, user, selected, cancellationToken);
                break;
        }

        await _db.SaveChangesAsync(cancellationToken);

        return new AcceptInviteResultDto
        {
            InviteId = invite.Id,
            Message = "Account links updated successfully."
        };
    }

    private async Task UpdatePlayerLinkAsync(Guid ageGroupId, Guid userId, List<Guid> selected, CancellationToken ct)
    {
        if (selected.Count > 1)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["SelectedEntityIds"] = new[] { "You can only link one player account." }
            });
        }

        var availablePlayers = await _db.PlayerAgeGroups
            .Where(pag => pag.AgeGroupId == ageGroupId)
            .Select(pag => pag.Player)
            .Where(p => !p.IsArchived)
            .ToListAsync(ct);

        if (selected.Any(id => availablePlayers.All(p => p.Id != id)))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["SelectedEntityIds"] = new[] { "Selected player is not available for this invite." }
            });
        }

        var currentLinked = await _db.Players.Where(p => p.UserId == userId).ToListAsync(ct);
        foreach (var linked in currentLinked.Where(p => selected.Count == 0 || p.Id != selected[0]))
        {
            linked.UserId = null;
        }

        if (selected.Count == 1)
        {
            var target = availablePlayers.Single(p => p.Id == selected[0]);
            if (target.UserId != null && target.UserId != userId)
            {
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["SelectedEntityIds"] = new[] { "Selected player is already linked to another account." }
                });
            }

            target.UserId = userId;
        }
    }

    private async Task UpdateCoachLinkAsync(Guid ageGroupId, Guid userId, List<Guid> selected, CancellationToken ct)
    {
        if (selected.Count > 1)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["SelectedEntityIds"] = new[] { "You can only link one coach account." }
            });
        }

        var availableCoachIds = await _db.TeamCoaches
            .Where(tc => tc.Team.AgeGroupId == ageGroupId && !tc.Team.IsArchived)
            .Select(tc => tc.CoachId)
            .Distinct()
            .ToListAsync(ct);

        if (selected.Any(id => !availableCoachIds.Contains(id)))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["SelectedEntityIds"] = new[] { "Selected coach is not available for this invite." }
            });
        }

        var currentLinked = await _db.Coaches.Where(c => c.UserId == userId).ToListAsync(ct);
        foreach (var linked in currentLinked.Where(c => selected.Count == 0 || c.Id != selected[0]))
        {
            linked.UserId = null;
            linked.HasAccount = false;
        }

        if (selected.Count == 1)
        {
            var target = await _db.Coaches.FirstAsync(c => c.Id == selected[0], ct);
            if (target.UserId != null && target.UserId != userId)
            {
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["SelectedEntityIds"] = new[] { "Selected coach is already linked to another account." }
                });
            }

            target.UserId = userId;
            target.HasAccount = true;
        }
    }

    private async Task UpdateParentLinksAsync(Guid ageGroupId, User user, List<Guid> selected, CancellationToken ct)
    {
        var userId = user.Id;
        var availablePlayers = await _db.PlayerAgeGroups
            .Where(pag => pag.AgeGroupId == ageGroupId)
            .Select(pag => pag.Player)
            .Where(p => !p.IsArchived)
            .Select(p => p.Id)
            .Distinct()
            .ToListAsync(ct);

        if (selected.Any(id => !availablePlayers.Contains(id)))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["SelectedEntityIds"] = new[] { "Selected player is not available for this invite." }
            });
        }

        var existingLinks = await _db.PlayerParents
            .Where(pp => pp.ParentUserId == userId && availablePlayers.Contains(pp.PlayerId))
            .ToListAsync(ct);

        foreach (var link in existingLinks.Where(pp => !selected.Contains(pp.PlayerId)))
        {
            _db.PlayerParents.Remove(link);
        }

        foreach (var playerId in selected.Where(id => existingLinks.All(pp => pp.PlayerId != id)))
        {
            _db.PlayerParents.Add(new PlayerParent
            {
                Id = Guid.NewGuid(),
                PlayerId = playerId,
                ParentUserId = userId,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty
            });
        }
    }
}
