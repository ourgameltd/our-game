using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications;

public class GetMyNotificationsHandler : IRequestHandler<GetMyNotificationsQuery, PagedResponse<NotificationDto>>
{
    private readonly OurGameContext _db;

    public GetMyNotificationsHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<PagedResponse<NotificationDto>> Handle(GetMyNotificationsQuery query, CancellationToken cancellationToken)
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
                Audience = notification.Audience,
                CreatedAt = notification.CreatedAt,
                IsRead = read != null
            };

        if (query.UnreadOnly)
        {
            notificationsQuery = notificationsQuery.Where(n => !n.IsRead);
        }
        else if (query.ReadOnly)
        {
            notificationsQuery = notificationsQuery.Where(n => n.IsRead);
        }

        var totalCount = await notificationsQuery.CountAsync(cancellationToken);
        var items = await notificationsQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return PagedResponse<NotificationDto>.Create(items, query.Page, query.PageSize, totalCount);
    }
}
