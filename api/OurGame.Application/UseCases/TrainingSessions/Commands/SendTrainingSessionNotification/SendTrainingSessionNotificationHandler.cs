using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.TrainingSessions.Commands.SendTrainingSessionNotification;

public record SendTrainingSessionNotificationCommand(Guid SessionId) : IRequest;

public class SendTrainingSessionNotificationHandler : IRequestHandler<SendTrainingSessionNotificationCommand>
{
    private readonly OurGameContext _db;
    private readonly INotificationService _notificationService;

    public SendTrainingSessionNotificationHandler(OurGameContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task Handle(SendTrainingSessionNotificationCommand command, CancellationToken cancellationToken)
    {
        var session = await _db.TrainingSessions
            .Where(s => s.Id == command.SessionId)
            .Select(s => new
            {
                s.Id,
                s.SessionDate,
                s.Location,
                s.TeamId,
                TeamName = s.Team.Name,
                s.Team.AgeGroupId,
                s.Team.ClubId,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (session == null)
        {
            throw new NotFoundException("TrainingSession", command.SessionId.ToString());
        }

        var invitedPlayerIds = await _db.SessionAttendances
            .Where(sa => sa.SessionId == command.SessionId)
            .Select(sa => sa.PlayerId)
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

        var coachUserIds = await _db.SessionCoaches
            .Where(sc => sc.SessionId == command.SessionId && sc.Coach.UserId != null)
            .Select(sc => sc.Coach.UserId!.Value)
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

        var sessionDate = session.SessionDate.ToString("ddd d MMM, h:mmtt");
        var title = $"Training: {session.TeamName}";
        var message = $"Session on {sessionDate} at {session.Location}";
        var url = $"/dashboard/{session.ClubId}/age-groups/{session.AgeGroupId}/teams/{session.TeamId}/training/{session.Id}";

        foreach (var userId in allUserIds)
        {
            await _notificationService.CreateAsync(
                userId,
                "training_session_reminder",
                title,
                message,
                url,
                sendPush: true,
                cancellationToken);
        }
    }
}
