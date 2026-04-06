using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.UseCases.Invites;
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
    private static readonly Dictionary<InviteType, string> InviteTypeLabels = new()
    {
        [InviteType.Coach] = "Coach",
        [InviteType.Player] = "Player",
        [InviteType.Parent] = "Guardian",
    };

    private readonly OurGameContext _db;
    private readonly IEmailService _emailService;
    private readonly ILogger<CreateInviteHandler> _logger;

    public CreateInviteHandler(OurGameContext db, IEmailService emailService, ILogger<CreateInviteHandler> logger)
    {
        _db = db;
        _emailService = emailService;
        _logger = logger;
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
        await ValidateEntityAsync(dto, cancellationToken);

        var normalizedEmail = dto.IsOpenInvite
            ? InviteConstants.OpenInviteEmail
            : dto.Email.Trim().ToLowerInvariant();

        // Validate no duplicate pending invite for same target (open invite ignores email)
        var duplicateExists = dto.IsOpenInvite
            ? await _db.Invites
                .AnyAsync(i => i.EntityId == dto.EntityId
                               && i.Type == dto.Type
                               && i.ClubId == dto.ClubId
                               && i.Email == InviteConstants.OpenInviteEmail
                               && i.Status == InviteStatus.Pending,
                    cancellationToken)
            : await _db.Invites
                .AnyAsync(i => i.Email.ToLower() == normalizedEmail
                               && i.EntityId == dto.EntityId
                               && i.Status == InviteStatus.Pending,
                    cancellationToken);

        if (duplicateExists)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Email"] = new[] { dto.IsOpenInvite
                    ? "A pending open invite already exists for this role and entity."
                    : "A pending invite already exists for this email and entity." }
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
            Code = InviteConstants.GenerateCode(),
            Email = normalizedEmail,
            Type = dto.Type,
            EntityId = dto.EntityId,
            ClubId = dto.ClubId,
            Status = InviteStatus.Pending,
            CreatedByUserId = creatingUser.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(InviteConstants.InviteExpiryDays)
        };

        _db.Invites.Add(invite);
        await _db.SaveChangesAsync(cancellationToken);

        // Send invite email (fire-and-log: invite is saved even if email delivery fails)
        var roleLabel = InviteTypeLabels.GetValueOrDefault(dto.Type, "Member");
        var emailSent = await _emailService.SendInviteEmailAsync(
            invite.Email,
            string.Empty,
            club.Name,
            roleLabel,
            invite.Code,
            cancellationToken);

        if (!emailSent)
        {
            _logger.LogWarning(
                "Invite {InviteId} created but email delivery to {Email} failed. Code: {Code}",
                invite.Id, invite.Email, invite.Code);
        }

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
            ExpiresAt = invite.ExpiresAt,
            IsOpenInvite = dto.IsOpenInvite
        };
    }

    private async Task ValidateEntityAsync(CreateInviteRequestDto dto, CancellationToken cancellationToken)
    {
        if (dto.IsOpenInvite)
        {
            var ageGroup = await _db.AgeGroups
                .FirstOrDefaultAsync(ag => ag.Id == dto.EntityId && ag.ClubId == dto.ClubId, cancellationToken);

            if (ageGroup == null)
            {
                throw new NotFoundException("AgeGroup", dto.EntityId);
            }

            return;
        }

        switch (dto.Type)
        {
            case InviteType.Coach:
                var coach = await _db.Coaches
                    .FirstOrDefaultAsync(c => c.Id == dto.EntityId, cancellationToken);
                if (coach == null)
                    throw new NotFoundException("Coach", dto.EntityId);
                if (coach.UserId.HasValue)
                    throw new ValidationException(new Dictionary<string, string[]>
                    {
                        ["EntityId"] = new[] { "This coach already has an account linked." }
                    });
                break;

            case InviteType.Player:
                var player = await _db.Players
                    .FirstOrDefaultAsync(p => p.Id == dto.EntityId, cancellationToken);
                if (player == null)
                    throw new NotFoundException("Player", dto.EntityId);
                if (player.UserId.HasValue)
                    throw new ValidationException(new Dictionary<string, string[]>
                    {
                        ["EntityId"] = new[] { "This player already has an account linked." }
                    });
                break;

            case InviteType.Parent:
                var parentPlayer = await _db.Players
                    .FirstOrDefaultAsync(p => p.Id == dto.EntityId, cancellationToken);
                if (parentPlayer == null)
                    throw new NotFoundException("Player", dto.EntityId);
                break;

            default:
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    ["Type"] = new[] { "Invalid invite type." }
                });
        }
    }

}
