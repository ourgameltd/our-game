using MediatR;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Commands.SendCardNotification;

public record SendCardNotificationCommand(
    Guid MatchId,
    string PlayerName,
    string CardType,
    int Minute,
    string Period,
    int HomeScore,
    int AwayScore) : IRequest;

public class SendCardNotificationValidator : AbstractValidator<SendCardNotificationCommand>
{
    public SendCardNotificationValidator()
    {
        RuleFor(x => x.MatchId).NotEmpty();
        RuleFor(x => x.PlayerName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CardType).NotEmpty().Must(t => t == "yellow" || t == "red")
            .WithMessage("CardType must be 'yellow' or 'red'");
        RuleFor(x => x.Minute).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Period).NotEmpty().MaximumLength(50);
        RuleFor(x => x.HomeScore).GreaterThanOrEqualTo(0);
        RuleFor(x => x.AwayScore).GreaterThanOrEqualTo(0);
    }
}

public class SendCardNotificationHandler : IRequestHandler<SendCardNotificationCommand>
{
    private readonly OurGameContext _db;
    private readonly INotificationService _notificationService;

    public SendCardNotificationHandler(OurGameContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task Handle(SendCardNotificationCommand command, CancellationToken cancellationToken)
    {
        var match = await _db.Matches
            .Where(m => m.Id == command.MatchId)
            .Select(m => new
            {
                m.Id,
                m.Opposition,
                m.TeamId,
                TeamName = m.Team.Name,
                m.Team.AgeGroupId,
                m.Team.ClubId,
                HomeTeamName = m.IsHome ? m.Team.Name : m.Opposition,
                AwayTeamName = m.IsHome ? m.Opposition : m.Team.Name,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (match == null)
        {
            throw new NotFoundException("Match", command.MatchId.ToString());
        }

        var invitedPlayerIds = await _db.MatchAttendances
            .Where(ma => ma.MatchId == command.MatchId)
            .Select(ma => ma.PlayerId)
            .ToListAsync(cancellationToken);

        var playerUserIds = await _db.Players
            .Where(p => invitedPlayerIds.Contains(p.Id) && p.UserId != null)
            .Select(p => p.UserId!.Value)
            .ToListAsync(cancellationToken);

        var parentUserIds = await _db.EmergencyContacts
            .Where(ec => ec.PlayerId != null
                      && invitedPlayerIds.Contains(ec.PlayerId.Value)
                      && ec.UserId != null)
            .Select(ec => ec.UserId!.Value)
            .ToListAsync(cancellationToken);

        var coachUserIds = await _db.TeamCoaches
            .Where(tc => tc.TeamId == match.TeamId && tc.Coach.UserId != null)
            .Select(tc => tc.Coach.UserId!.Value)
            .ToListAsync(cancellationToken);

        var coachUserIdSet = coachUserIds.ToHashSet();
        var playerAndParentUserIds = playerUserIds
            .Concat(parentUserIds)
            .Distinct()
            .Where(id => !coachUserIdSet.Contains(id))
            .ToList();

        if (playerAndParentUserIds.Count == 0 && coachUserIds.Count == 0)
        {
            return;
        }

        var url = $"/dashboard/{match.ClubId}/age-groups/{match.AgeGroupId}/teams/{match.TeamId}/matches/{match.Id}";
        var cardEmoji = command.CardType == "red" ? "🟥" : "🟨";
        var cardLabel = command.CardType == "red" ? "Red" : "Yellow";
        var title = $"{cardEmoji} {cardLabel} Card: {command.PlayerName}";
        var message = $"{command.Minute}' ({command.Period}) — {match.HomeTeamName} {command.HomeScore}–{command.AwayScore} {match.AwayTeamName}";

        foreach (var userId in playerAndParentUserIds)
        {
            await _notificationService.CreateAsync(
                userId,
                "card",
                title,
                message,
                url,
                sendPush: true,
                audience: "player",
                cancellationToken);
        }

        foreach (var userId in coachUserIds.Distinct())
        {
            await _notificationService.CreateAsync(
                userId,
                "card",
                title,
                message,
                url,
                sendPush: true,
                audience: "coach",
                cancellationToken);
        }
    }
}
