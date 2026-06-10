using System.Net.Http;
using System.Text;
using System.Text.Json;
using Lib.Net.Http.WebPush;
using Lib.Net.Http.WebPush.Authentication;
using LibPushSubscription = Lib.Net.Http.WebPush.PushSubscription;
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
public class PushNotificationService(
    OurGameContext db,
    IConfiguration configuration,
    ILogger<PushNotificationService> logger) : IPushNotificationService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task SendToUserAsync(Guid userId, PushPayload payload, CancellationToken cancellationToken = default)
    {
        var vapidPublicKey = configuration["Vapid:PublicKey"];
        var vapidPrivateKey = configuration["Vapid:PrivateKey"];
        var vapidSubject = configuration["Vapid:Subject"] ?? "mailto:admin@isourgame.com";

        if (string.IsNullOrEmpty(vapidPublicKey) || string.IsNullOrEmpty(vapidPrivateKey))
        {
            logger.LogWarning("VAPID keys are not configured – skipping push notification for user {UserId}", userId);
            return;
        }

        var subscriptions = await db.PushSubscriptions
            .Where(ps => ps.UserId == userId)
            .ToListAsync(cancellationToken);

        if (subscriptions.Count == 0)
        {
            logger.LogInformation("No push subscriptions found for user {UserId} – skipping push", userId);
            return;
        }

        logger.LogInformation("Sending push notification to {Count} subscription(s) for user {UserId}", subscriptions.Count, userId);

        var payloadJson = JsonSerializer.Serialize(new
        {
            title = payload.Title,
            body = payload.Body,
            url = payload.Url ?? "/notifications",
            icon = payload.Icon,
            tag = payload.Tag,
        }, JsonOptions);

        using var vapidAuthentication = new VapidAuthentication(vapidPublicKey, vapidPrivateKey)
        {
            Subject = vapidSubject
        };

        using var httpClient = new HttpClient(new PushErrorLoggingHandler(logger));
        var pushClient = new PushServiceClient(httpClient)
        {
            DefaultAuthentication = vapidAuthentication
        };

        var staleSubscriptions = new List<PushSubscription>();

        foreach (var sub in subscriptions)
        {
            try
            {
                var pushSubscription = new LibPushSubscription
                {
                    Endpoint = sub.Endpoint
                };
                pushSubscription.SetKey(PushEncryptionKeyName.P256DH, sub.P256dh);
                pushSubscription.SetKey(PushEncryptionKeyName.Auth, sub.Auth);

                var message = new PushMessage(payloadJson)
                {
                    Urgency = PushMessageUrgency.High,
                    TimeToLive = 86400,
                };

                await pushClient.RequestPushMessageDeliveryAsync(pushSubscription, message, vapidAuthentication, VapidAuthenticationScheme.Vapid, cancellationToken);
                logger.LogInformation("Push notification sent successfully to subscription {SubscriptionId} for user {UserId}", sub.Id, userId);
            }
            catch (PushServiceClientException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Gone || ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                logger.LogInformation("Removing stale push subscription {SubscriptionId} for user {UserId} (HTTP {StatusCode})", sub.Id, userId, (int)ex.StatusCode);
                staleSubscriptions.Add(sub);
            }
            catch (PushServiceClientException ex)
            {
                var detail = ex.InnerException?.Message ?? ex.Message;
                logger.LogError(ex, "Push delivery failed for subscription {SubscriptionId} user {UserId} – HTTP {StatusCode}: {Detail}",
                    sub.Id, userId, (int)ex.StatusCode, detail);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error sending push to subscription {SubscriptionId} for user {UserId}", sub.Id, userId);
            }
        }

        if (staleSubscriptions.Count > 0)
        {
            db.PushSubscriptions.RemoveRange(staleSubscriptions);
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private sealed class PushErrorLoggingHandler(ILogger logger) : DelegatingHandler(new HttpClientHandler())
    {
        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var response = await base.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                logger.LogError("Push service {Host} returned {StatusCode}: {Body}",
                    request.RequestUri?.Host, (int)response.StatusCode, body);

                var buffered = new ByteArrayContent(Encoding.UTF8.GetBytes(body));
                foreach (var (key, values) in response.Content.Headers)
                    buffered.Headers.TryAddWithoutValidation(key, values);
                response.Content = buffered;
            }

            return response;
        }
    }
}
