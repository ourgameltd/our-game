namespace OurGame.Application.UseCases.PushSubscriptions.Commands.DeletePushSubscription.DTOs;

/// <summary>
/// Request DTO for removing a push subscription by its endpoint URL.
/// </summary>
public class DeletePushSubscriptionRequest
{
    /// <summary>
    /// The push service endpoint URL to remove.
    /// </summary>
    public string Endpoint { get; set; } = string.Empty;
}
