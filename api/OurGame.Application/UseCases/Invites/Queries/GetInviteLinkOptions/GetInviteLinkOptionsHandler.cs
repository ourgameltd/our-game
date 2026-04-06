using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Invites;
using OurGame.Application.UseCases.Invites.Queries.GetInviteLinkOptions.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Invites.Queries.GetInviteLinkOptions;

public class GetInviteLinkOptionsHandler : IRequestHandler<GetInviteLinkOptionsQuery, InviteLinkOptionsDto>
{
    private readonly OurGameContext _db;

    public GetInviteLinkOptionsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<InviteLinkOptionsDto> Handle(GetInviteLinkOptionsQuery query, CancellationToken cancellationToken)
    {
        var invite = await _db.Invites
            .FirstOrDefaultAsync(i => i.Code == query.Code, cancellationToken);

        if (invite == null)
        {
            throw new NotFoundException("Invite", query.Code);
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.AuthId == query.AuthId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", query.AuthId);
        }

        var result = new InviteLinkOptionsDto
        {
            Code = invite.Code,
            Type = invite.Type,
            CanSelectMultiple = invite.Type == InviteType.Parent
        };

        if (!InviteConstants.IsOpenInviteEmail(invite.Email))
        {
            return result;
        }

        switch (invite.Type)
        {
            case InviteType.Player:
                result.Candidates = await _db.PlayerAgeGroups
                    .Where(pag => pag.AgeGroupId == invite.EntityId)
                    .Select(pag => pag.Player)
                    .Where(p => !p.IsArchived)
                    .OrderBy(p => p.FirstName).ThenBy(p => p.LastName)
                    .Select(p => new InviteLinkCandidateDto
                    {
                        Id = p.Id,
                        Name = (p.FirstName + " " + p.LastName).Trim(),
                        IsLinked = p.UserId != null,
                        IsLinkedToCurrentUser = p.UserId == user.Id
                    })
                    .ToListAsync(cancellationToken);
                result.HasSingleLinkAssigned = result.Candidates.Any(c => c.IsLinkedToCurrentUser);
                break;

            case InviteType.Coach:
                result.Candidates = await _db.Coaches
                    .Where(c => c.ClubId == invite.ClubId && !c.IsArchived)
                    .OrderBy(c => c.FirstName).ThenBy(c => c.LastName)
                    .Select(c => new InviteLinkCandidateDto
                    {
                        Id = c.Id,
                        Name = (c.FirstName + " " + c.LastName).Trim(),
                        IsLinked = c.UserId != null,
                        IsLinkedToCurrentUser = c.UserId == user.Id
                    })
                    .ToListAsync(cancellationToken);
                result.HasSingleLinkAssigned = result.Candidates.Any(c => c.IsLinkedToCurrentUser);
                break;

            case InviteType.Parent:
                var linkedPlayerIds = await _db.EmergencyContacts
                    .Where(ec => ec.UserId == user.Id && ec.PlayerId != null)
                    .Select(ec => ec.PlayerId!.Value)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                result.Candidates = await _db.PlayerAgeGroups
                    .Where(pag => pag.AgeGroupId == invite.EntityId)
                    .Select(pag => pag.Player)
                    .Where(p => !p.IsArchived)
                    .OrderBy(p => p.FirstName).ThenBy(p => p.LastName)
                    .Select(p => new InviteLinkCandidateDto
                    {
                        Id = p.Id,
                        Name = (p.FirstName + " " + p.LastName).Trim(),
                        IsLinked = linkedPlayerIds.Contains(p.Id),
                        IsLinkedToCurrentUser = linkedPlayerIds.Contains(p.Id)
                    })
                    .ToListAsync(cancellationToken);
                break;
        }

        return result;
    }
}
