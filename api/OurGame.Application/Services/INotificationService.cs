using Microsoft.Extensions.Logging;
using OurGame.Persistence.Models;

namespace OurGame.Application.Services;

public interface INotificationService
{
    Task<Notification> CreateAsync(
        Guid? userId,
        string type,
        string title,
        string message,
        string? url = null,
        bool sendPush = false,
        CancellationToken cancellationToken = default);
}

internal class NotificationService : INotificationService
{
    private readonly OurGameContext _db;
    private readonly IPushNotificationService _pushNotificationService;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        OurGameContext db,
        IPushNotificationService pushNotificationService,
        ILogger<NotificationService> logger)
    {
        _db = db;
        _pushNotificationService = pushNotificationService;
        _logger = logger;
    }

    public async Task<Notification> CreateAsync(
        Guid? userId,
        string type,
        string title,
        string message,
        string? url = null,
        bool sendPush = false,
        CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            Url = url,
            CreatedAt = DateTime.UtcNow
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync(cancellationToken);

        if (sendPush && userId.HasValue)
        {
            try
            {
                await _pushNotificationService.SendToUserAsync(
                    userId.Value,
                    new PushPayload
                    {
                        Title = title,
                        Body = message,
                        Url = url ?? "/notifications",
                        Tag = $"notification:{notification.Id}"
                    },
                    cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send push notification for persisted notification {NotificationId}", notification.Id);
            }
        }

        return notification;
    }
}
