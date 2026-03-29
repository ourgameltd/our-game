using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Invites.Queries.GetInviteByCode.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Invites.Queries.GetInviteByCode;

/// <summary>
/// Handler for anonymously retrieving invite display info by code.
/// Does not expose internal entity IDs.
/// </summary>
public class GetInviteByCodeHandler : IRequestHandler<GetInviteByCodeQuery, InviteDetailsDto>
{
    private const int MaxMaskedCharacters = 4;
    private readonly OurGameContext _db;

    public GetInviteByCodeHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<InviteDetailsDto> Handle(GetInviteByCodeQuery query, CancellationToken cancellationToken)
    {
        var invite = await _db.Invites
            .Include(i => i.Club)
            .FirstOrDefaultAsync(i => i.Code == query.Code, cancellationToken);

        if (invite == null)
            throw new NotFoundException("Invite", query.Code);

        return new InviteDetailsDto
        {
            Code = invite.Code,
            MaskedEmail = MaskEmail(invite.Email),
            Type = invite.Type,
            ClubName = invite.Club?.Name ?? string.Empty,
            Status = invite.Status,
            ExpiresAt = invite.ExpiresAt
        };
    }

    private static string MaskEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return string.Empty;

        var atIndex = email.IndexOf('@');
        if (atIndex <= 1)
            return "***" + email[atIndex..];

        var local = email[..atIndex];
        var domain = email[atIndex..];
        var maskedLocal = local[0] + new string('*', Math.Min(local.Length - 1, MaxMaskedCharacters));
        return maskedLocal + domain;
    }
}
