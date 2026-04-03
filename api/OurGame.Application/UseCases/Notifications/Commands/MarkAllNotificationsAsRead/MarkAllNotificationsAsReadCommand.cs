using MediatR;

namespace OurGame.Application.UseCases.Notifications.Commands.MarkAllNotificationsAsRead;

public record MarkAllNotificationsAsReadCommand(string AuthId) : IRequest<int>;
