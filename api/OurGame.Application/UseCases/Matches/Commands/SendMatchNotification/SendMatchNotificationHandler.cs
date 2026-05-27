using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Matches.Commands.SendMatchNotification;

public record SendMatchNotificationCommand(Guid MatchId) : IRequest;

public class SendMatchNotificationHandler : IRequestHandler<SendMatchNotificationCommand>
{
    private readonly OurGameContext _db;
    private readonly INotificationService _notificationService;

    public SendMatchNotificationHandler(OurGameContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task Handle(SendMatchNotificationCommand command, CancellationToken cancellationToken)
    {
        var match = await _db.Matches
            .Where(m => m.Id == command.MatchId)
            .Select(m => new
            {
                m.Id,
                m.Opposition,
                m.KickOffTime,
                m.Location,
                m.IsHome,
                m.TeamId,
                TeamName = m.Team.Name,
                m.Team.AgeGroupId,
                m.Team.ClubId,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (match == null)
        {
            throw new NotFoundException("Match", command.MatchId.ToString());
        }

        // Players invited to the match
        var invitedPlayerIds = await _db.MatchAttendances
            .Where(ma => ma.MatchId == command.MatchId)
            .Select(ma => ma.PlayerId)
            .ToListAsync(cancellationToken);

        // User IDs from three sources, all deduplicated into one set:

        // 1. Players who have a linked user account
        var playerUserIds = await _db.Players
            .Where(p => invitedPlayerIds.Contains(p.Id) && p.UserId != null)
            .Select(p => p.UserId!.Value)
            .ToListAsync(cancellationToken);

        // 2. Parents/guardians of invited players via EmergencyContacts
        var parentUserIds = await _db.EmergencyContacts
            .Where(ec => ec.PlayerId != null
                      && invitedPlayerIds.Contains(ec.PlayerId.Value)
                      && ec.UserId != null)
            .Select(ec => ec.UserId!.Value)
            .ToListAsync(cancellationToken);

        // 3. Coaches on the team (TeamCoaches) who have a linked user account
        var coachUserIds = await _db.TeamCoaches
            .Where(tc => tc.TeamId == match.TeamId && tc.Coach.UserId != null)
            .Select(tc => tc.Coach.UserId!.Value)
            .ToListAsync(cancellationToken);

        var allUserIds = playerUserIds
            .Concat(parentUserIds)
            .Concat(coachUserIds)
            .Distinct()
            .ToList();

        if (allUserIds.Count == 0)
        {
            return;
        }

        var kickOff = match.KickOffTime?.ToString("ddd d MMM, h:mmtt") ?? "TBC";
        var venue = match.IsHome ? $"{match.Location} (Home)" : $"{match.Location} (Away)";
        var title = $"Match: {match.TeamName} vs {match.Opposition}";
        var message = $"Kick off {kickOff} at {venue}";
        var url = $"/dashboard/{match.ClubId}/age-groups/{match.AgeGroupId}/teams/{match.TeamId}/matches/{match.Id}";

        foreach (var userId in allUserIds)
        {
            await _notificationService.CreateAsync(
                userId,
                "match_reminder",
                title,
                message,
                url,
                sendPush: true,
                cancellationToken);
        }
    }
}
