namespace OurGame.Application.UseCases.PushSubscriptions.Commands.SavePushSubscription.DTOs;

/// <summary>
/// Request DTO for saving a Web Push subscription from the browser.
/// This is the JSON structure returned by <c>PushSubscription.toJSON()</c> in the browser.
/// </summary>
public class SavePushSubscriptionRequest
{
    /// <summary>
    /// The push service endpoint URL.
    /// </summary>
    public string Endpoint { get; set; } = string.Empty;

    /// <summary>
    /// The encryption keys from the browser subscription.
    /// </summary>
    public PushSubscriptionKeys? Keys { get; set; }
}

/// <summary>
/// Browser-provided encryption keys for a push subscription.
/// </summary>
public class PushSubscriptionKeys
{
    /// <summary>
    /// The p256dh (Diffie-Hellman) public key (base64url-encoded).
    /// </summary>
    public string P256dh { get; set; } = string.Empty;

    /// <summary>
    /// The auth secret (base64url-encoded).
    /// </summary>
    public string Auth { get; set; } = string.Empty;
}
