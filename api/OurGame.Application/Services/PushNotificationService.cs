using Lib.Net.Http.WebPush;
using Lib.Net.Http.WebPush.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OurGame.Persistence.Models;

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
/// Implementation of <see cref="IPushNotificationService"/> using VAPID Web Push (RFC 8291 aes128gcm).
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
        var vapidSubject = _configuration["Vapid:Subject"] ?? "mailto:admin@isourgame.com";

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
            _logger.LogInformation("No push subscriptions found for user {UserId} – skipping push", userId);
            return;
        }

        _logger.LogInformation("Sending push notification to {Count} subscription(s) for user {UserId}", subscriptions.Count, userId);

        var payloadJson = System.Text.Json.JsonSerializer.Serialize(new
        {
            title = payload.Title,
            body = payload.Body,
            url = payload.Url ?? "/notifications",
            icon = payload.Icon,
            tag = payload.Tag,
        }, new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase });

        using var vapidAuthentication = new VapidAuthentication(vapidPublicKey, vapidPrivateKey)
        {
            Subject = vapidSubject
        };

        var pushClient = new PushServiceClient
        {
            DefaultAuthentication = vapidAuthentication
        };

        var staleSubscriptions = new List<OurGame.Persistence.Models.PushSubscription>();

        foreach (var sub in subscriptions)
        {
            try
            {
                var pushSubscription = new Lib.Net.Http.WebPush.PushSubscription();
                pushSubscription.Endpoint = sub.Endpoint;
                pushSubscription.SetKey(PushEncryptionKeyName.P256DH, sub.P256dh);
                pushSubscription.SetKey(PushEncryptionKeyName.Auth, sub.Auth);

                var message = new PushMessage(payloadJson)
                {
                    Topic = payload.Tag,
                    Urgency = PushMessageUrgency.High,
                    TimeToLive = 86400,
                };

                await pushClient.RequestPushMessageDeliveryAsync(pushSubscription, message, cancellationToken);
                _logger.LogInformation("Push notification sent successfully to subscription {SubscriptionId} for user {UserId}", sub.Id, userId);
            }
            catch (PushServiceClientException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Gone || ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogInformation("Removing stale push subscription {SubscriptionId} for user {UserId} (HTTP {StatusCode})", sub.Id, userId, (int)ex.StatusCode);
                staleSubscriptions.Add(sub);
            }
            catch (PushServiceClientException ex)
            {
                // ex.Message is just the HTTP reason phrase; the inner exception may carry the response body
                var detail = ex.InnerException?.Message ?? ex.Message;
                _logger.LogError(ex, "Push delivery failed for subscription {SubscriptionId} user {UserId} – HTTP {StatusCode}: {Detail}",
                    sub.Id, userId, (int)ex.StatusCode, detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error sending push to subscription {SubscriptionId} for user {UserId}", sub.Id, userId);
            }
        }

        if (staleSubscriptions.Count > 0)
        {
            _db.PushSubscriptions.RemoveRange(staleSubscriptions);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
