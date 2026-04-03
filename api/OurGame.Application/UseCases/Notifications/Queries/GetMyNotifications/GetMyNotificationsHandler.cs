using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications;

public class GetMyNotificationsHandler : IRequestHandler<GetMyNotificationsQuery, List<NotificationDto>>
{
    private readonly OurGameContext _db;

    public GetMyNotificationsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<NotificationDto>> Handle(GetMyNotificationsQuery query, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.AuthId == query.AuthId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User", query.AuthId);
        }

        var notificationsQuery =
            from notification in _db.Notifications.AsNoTracking()
            join read in _db.NotificationReads.AsNoTracking().Where(nr => nr.UserId == user.Id)
                on notification.Id equals read.NotificationId into reads
            from read in reads.DefaultIfEmpty()
            where notification.UserId == null || notification.UserId == user.Id
            orderby notification.CreatedAt descending
            select new NotificationDto
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Url = notification.Url,
                CreatedAt = notification.CreatedAt,
                IsRead = read != null
            };

        if (query.UnreadOnly)
        {
            notificationsQuery = notificationsQuery.Where(n => !n.IsRead);
        }

        return await notificationsQuery.ToListAsync(cancellationToken);
    }
}
