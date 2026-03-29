using System.Security.Cryptography;
using System.Text;
using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Invites.Commands.CreateInvite.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Invites.Commands.CreateInvite;

/// <summary>
/// Handler for creating a new invite.
/// Validates entity exists, is not already claimed, and no duplicate pending invite exists.
/// </summary>
public class CreateInviteHandler : IRequestHandler<CreateInviteCommand, InviteDto>
{
    private const string CodeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const int InviteExpiryDays = 30;

    private readonly OurGameContext _db;

    public CreateInviteHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<InviteDto> Handle(CreateInviteCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Request;

        // Find the creating user
        var creatingUser = await _db.Users
            .FirstOrDefaultAsync(u => u.AuthId == command.AuthId, cancellationToken);

        if (creatingUser == null)
        {
            throw new NotFoundException("User", command.AuthId);
        }

        // Validate entity exists and is not already claimed
        await ValidateEntityAsync(dto.Type, dto.EntityId, cancellationToken);

        // Validate no duplicate pending invite for same email+entity
        var duplicateExists = await _db.Invites
            .AnyAsync(i => i.Email.ToLower() == dto.Email.ToLower()
                           && i.EntityId == dto.EntityId
                           && i.Status == InviteStatus.Pending,
                cancellationToken);

        if (duplicateExists)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Email"] = new[] { "A pending invite already exists for this email and entity." }
            });
        }

        // Get club for display name
        var club = await _db.Clubs
            .FirstOrDefaultAsync(c => c.Id == dto.ClubId, cancellationToken);

        if (club == null)
        {
            throw new NotFoundException("Club", dto.ClubId);
        }

        var invite = new Invite
        {
            Id = Guid.NewGuid(),
            Code = GenerateCode(),
            Email = dto.Email.ToLowerInvariant(),
            Type = dto.Type,
            EntityId = dto.EntityId,
            ClubId = dto.ClubId,
            Status = InviteStatus.Pending,
            CreatedByUserId = creatingUser.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(InviteExpiryDays)
        };

        _db.Invites.Add(invite);
        await _db.SaveChangesAsync(cancellationToken);

        return new InviteDto
        {
            Id = invite.Id,
            Code = invite.Code,
            Email = invite.Email,
            Type = invite.Type,
            EntityId = invite.EntityId,
            ClubId = invite.ClubId,
            ClubName = club.Name,
            Status = invite.Status,
            CreatedAt = invite.CreatedAt,
            ExpiresAt = invite.ExpiresAt
        };
    }

    private async Task ValidateEntityAsync(InviteType type, Guid entityId, CancellationToken cancellationToken)
    {
        switch (type)
        {
            case InviteType.Coach:
                var coach = await _db.Coaches
                    .FirstOrDefaultAsync(c => c.Id == entityId, cancellationToken);
                if (coach == null)
                    throw new NotFoundException("Coach", entityId);
                if (coach.UserId.HasValue)
                    throw new ValidationException(new Dictionary<string, string[]>
                    {
                        ["EntityId"] = new[] { "This coach already has an account linked." }
                    });
                break;

            case InviteType.Player:
                var player = await _db.Players
                    .FirstOrDefaultAsync(p => p.Id == entityId, cancellationToken);
                if (player == null)
                    throw new NotFoundException("Player", entityId);
                if (player.UserId.HasValue)
                    throw new ValidationException(new Dictionary<string, string[]>
                    {
                        ["EntityId"] = new[] { "This player already has an account linked." }
                    });
                break;

            case InviteType.Parent:
                var parentPlayer = await _db.Players
                    .FirstOrDefaultAsync(p => p.Id == entityId, cancellationToken);
                if (parentPlayer == null)
                    throw new NotFoundException("Player", entityId);
                break;

            default:
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["Type"] = new[] { "Invalid invite type." }
                });
        }
    }

    private static string GenerateCode()
    {
        var bytes = new byte[8];
        RandomNumberGenerator.Fill(bytes);
        var sb = new StringBuilder(8);
        foreach (var b in bytes)
        {
            sb.Append(CodeChars[b % CodeChars.Length]);
        }
        return sb.ToString();
    }
}
