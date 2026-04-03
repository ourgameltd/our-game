using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Notifications.Commands.MarkNotificationAsRead;

public class MarkNotificationAsReadHandler : IRequestHandler<MarkNotificationAsReadCommand, bool>
{
    private readonly OurGameContext _db;

    public MarkNotificationAsReadHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<bool> Handle(MarkNotificationAsReadCommand command, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.AuthId == command.AuthId, cancellationToken)
            ?? throw new NotFoundException("User", command.AuthId);

        var notification = await _db.Notifications
            .AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == command.NotificationId, cancellationToken);

        if (notification == null)
        {
            throw new NotFoundException("Notification", command.NotificationId);
        }

        if (notification.UserId.HasValue && notification.UserId != user.Id)
        {
            throw new ValidationException("NotificationId", "Notification does not belong to the current user.");
        }

        var alreadyRead = await _db.NotificationReads
            .AnyAsync(nr => nr.NotificationId == command.NotificationId && nr.UserId == user.Id, cancellationToken);

        if (!alreadyRead)
        {
            _db.NotificationReads.Add(new NotificationRead
            {
                Id = Guid.NewGuid(),
                NotificationId = command.NotificationId,
                UserId = user.Id,
                ReadAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync(cancellationToken);
        }

        return true;
    }
}
