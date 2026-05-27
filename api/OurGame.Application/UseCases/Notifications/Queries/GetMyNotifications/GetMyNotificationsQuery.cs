using MediatR;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications.DTOs;

namespace OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications;

public record GetMyNotificationsQuery(
    string AuthId,
    bool UnreadOnly,
    bool ReadOnly = false,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResponse<NotificationDto>>;
