using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.UseCases.Invites.Queries.GetClubInvites.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Invites.Queries.GetClubInvites;

/// <summary>
/// Handler for retrieving all invites for a given club (for admin management).
/// </summary>
public class GetClubInvitesHandler : IRequestHandler<GetClubInvitesQuery, List<ClubInviteDto>>
{
    private readonly OurGameContext _db;

    public GetClubInvitesHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<ClubInviteDto>> Handle(GetClubInvitesQuery query, CancellationToken cancellationToken)
    {
        return await _db.Invites
            .Where(i => i.ClubId == query.ClubId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new ClubInviteDto
            {
                Id = i.Id,
                Code = i.Code,
                Email = i.Email,
                Type = i.Type,
                EntityId = i.EntityId,
                Status = i.Status,
                CreatedAt = i.CreatedAt,
                ExpiresAt = i.ExpiresAt,
                AcceptedAt = i.AcceptedAt
            })
            .ToListAsync(cancellationToken);
    }
}
