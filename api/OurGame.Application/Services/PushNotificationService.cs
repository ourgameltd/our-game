using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OurGame.Persistence.Models;
using WebPushLib = WebPush;

namespace OurGame.Application.Services;

/// <summary>
/// Payload sent to the browser push service.
/// </summary>
public class PushPayload
{
    /// <summary>Notification title shown in the browser/OS notification.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Notification body text.</summary>
    public string Body { get; set; } = string.Empty;

    /// <summary>
    /// Optional deep-link URL the user navigates to when they click the notification.
    /// Defaults to <c>/notifications</c>.
    /// </summary>
    public string? Url { get; set; }

    /// <summary>Optional icon URL (defaults to /icons/icon-192x192.png in the service worker).</summary>
    public string? Icon { get; set; }

    /// <summary>Optional tag for notification deduplication.</summary>
    public string? Tag { get; set; }
}

/// <summary>
/// Service responsible for sending Web Push notifications to subscribed users.
/// </summary>
public interface IPushNotificationService
{
    /// <summary>
    /// Sends a push notification to all active subscriptions for a given user.
    /// </summary>
    /// <param name="userId">Internal database user ID.</param>
    /// <param name="payload">Notification content.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task SendToUserAsync(Guid userId, PushPayload payload, CancellationToken cancellationToken = default);
}

/// <summary>
/// Implementation of <see cref="IPushNotificationService"/> using VAPID Web Push.
/// </summary>
public class PushNotificationService : IPushNotificationService
{
    private readonly OurGameContext _db;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PushNotificationService> _logger;

    public PushNotificationService(
        OurGameContext db,
        IConfiguration configuration,
        ILogger<PushNotificationService> logger)
    {
        _db = db;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendToUserAsync(Guid userId, PushPayload payload, CancellationToken cancellationToken = default)
    {
        var vapidPublicKey = _configuration["Vapid:PublicKey"];
        var vapidPrivateKey = _configuration["Vapid:PrivateKey"];
        var vapidSubject = _configuration["Vapid:Subject"] ?? "mailto:admin@ourgame.app";

        if (string.IsNullOrEmpty(vapidPublicKey) || string.IsNullOrEmpty(vapidPrivateKey))
        {
            _logger.LogWarning("VAPID keys are not configured – skipping push notification for user {UserId}", userId);
            return;
        }

        var subscriptions = await _db.PushSubscriptions
            .Where(ps => ps.UserId == userId)
            .ToListAsync(cancellationToken);

        if (subscriptions.Count == 0)
        {
            _logger.LogDebug("No push subscriptions found for user {UserId}", userId);
            return;
        }

        var vapidDetails = new WebPushLib.VapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
        var webPushClient = new WebPushLib.WebPushClient();

        var payloadJson = System.Text.Json.JsonSerializer.Serialize(new
        {
            title = payload.Title,
            body = payload.Body,
            url = payload.Url ?? "/notifications",
            icon = payload.Icon,
            tag = payload.Tag,
        }, new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase });

        var staleSubscriptions = new List<PushSubscription>();

        foreach (var sub in subscriptions)
        {
            try
            {
                var pushSubscription = new WebPushLib.PushSubscription(sub.Endpoint, sub.P256dh, sub.Auth);
                await webPushClient.SendNotificationAsync(pushSubscription, payloadJson, vapidDetails);
                _logger.LogDebug("Push notification sent to subscription {SubscriptionId} for user {UserId}", sub.Id, userId);
            }
            catch (WebPushLib.WebPushException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Gone || ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // Subscription has expired or been revoked by the browser
                _logger.LogInformation("Removing stale push subscription {SubscriptionId} for user {UserId}", sub.Id, userId);
                staleSubscriptions.Add(sub);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send push notification to subscription {SubscriptionId} for user {UserId}", sub.Id, userId);
            }
        }

        if (staleSubscriptions.Count > 0)
        {
            _db.PushSubscriptions.RemoveRange(staleSubscriptions);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
