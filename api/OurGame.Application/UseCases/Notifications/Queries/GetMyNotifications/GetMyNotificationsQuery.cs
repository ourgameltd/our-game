using MediatR;
using OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications.DTOs;

namespace OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications;

public record GetMyNotificationsQuery(string AuthId, bool UnreadOnly) : IRequest<List<NotificationDto>>;
