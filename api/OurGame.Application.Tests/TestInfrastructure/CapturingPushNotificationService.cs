using OurGame.Application.Services;

namespace OurGame.Application.Tests.TestInfrastructure;

/// <summary>
/// Test double for IPushNotificationService that records all payloads sent.
/// No actual push delivery occurs.
/// </summary>
public sealed class CapturingPushNotificationService : IPushNotificationService
{
    public List<(Guid UserId, PushPayload Payload)> Sent { get; } = [];

    public Task SendToUserAsync(Guid userId, PushPayload payload, CancellationToken cancellationToken = default)
    {
        Sent.Add((userId, payload));
        return Task.CompletedTask;
    }
}
