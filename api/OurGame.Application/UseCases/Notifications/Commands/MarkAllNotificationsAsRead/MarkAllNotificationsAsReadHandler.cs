using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Notifications.Commands.MarkAllNotificationsAsRead;

public class MarkAllNotificationsAsReadHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, int>
{
    private readonly OurGameContext _db;

    public MarkAllNotificationsAsReadHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<int> Handle(MarkAllNotificationsAsReadCommand command, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.AuthId == command.AuthId, cancellationToken)
            ?? throw new NotFoundException("User", command.AuthId);

        var notifications = await _db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == null || n.UserId == user.Id)
            .Select(n => n.Id)
            .ToListAsync(cancellationToken);

        if (notifications.Count == 0)
        {
            return 0;
        }

        var existingReadIds = await _db.NotificationReads
            .AsNoTracking()
            .Where(nr => nr.UserId == user.Id && notifications.Contains(nr.NotificationId))
            .Select(nr => nr.NotificationId)
            .ToListAsync(cancellationToken);

        var unreadIds = notifications.Except(existingReadIds).ToList();
        if (unreadIds.Count == 0)
        {
            return 0;
        }

        var now = DateTime.UtcNow;
        _db.NotificationReads.AddRange(unreadIds.Select(id => new NotificationRead
        {
            Id = Guid.NewGuid(),
            NotificationId = id,
            UserId = user.Id,
            ReadAt = now
        }));

        await _db.SaveChangesAsync(cancellationToken);
        return unreadIds.Count;
    }
}
