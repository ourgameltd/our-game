using MediatR;

namespace OurGame.Application.UseCases.Notifications.Commands.MarkNotificationAsRead;

public record MarkNotificationAsReadCommand(string AuthId, Guid NotificationId) : IRequest<bool>;
