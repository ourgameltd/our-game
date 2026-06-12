using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Application.Services;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Notifications;

public class NotificationServiceTests
{
    [Fact]
    public async Task CreateAsync_WithSendPush_IncludesBadgeCountEqualToUnreadNotifications()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var userId = await db.SeedUserAsync("badge-test-user");

        // Seed two existing unread notifications for the user
        db.Context.Notifications.AddRange(
            new Notification { Id = Guid.NewGuid(), UserId = userId, Type = "match", Title = "Match 1", Message = "msg", CreatedAt = DateTime.UtcNow.AddHours(-2) },
            new Notification { Id = Guid.NewGuid(), UserId = userId, Type = "match", Title = "Match 2", Message = "msg", CreatedAt = DateTime.UtcNow.AddHours(-1) }
        );
        await db.Context.SaveChangesAsync();

        var pushService = new CapturingPushNotificationService();
        var service = new NotificationService(db.Context, pushService, NullLogger<NotificationService>.Instance);

        // Act — creates a third notification, so unread count becomes 3
        await service.CreateAsync(userId, "match", "Match 3", "body", "/feed", sendPush: true);

        Assert.Single(pushService.Sent);
        var (sentUserId, payload) = pushService.Sent[0];
        Assert.Equal(userId, sentUserId);
        Assert.Equal(3, payload.BadgeCount);
    }

    [Fact]
    public async Task CreateAsync_WhenUserHasReadSomeNotifications_BadgeCountReflectsOnlyUnread()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var userId = await db.SeedUserAsync("badge-read-user");

        var readNotifId = Guid.NewGuid();
        var unreadNotifId = Guid.NewGuid();

        db.Context.Notifications.AddRange(
            new Notification { Id = readNotifId, UserId = userId, Type = "match", Title = "Read One", Message = "msg", CreatedAt = DateTime.UtcNow.AddHours(-3) },
            new Notification { Id = unreadNotifId, UserId = userId, Type = "match", Title = "Unread One", Message = "msg", CreatedAt = DateTime.UtcNow.AddHours(-1) }
        );
        // Mark the first as read
        db.Context.NotificationReads.Add(new NotificationRead { Id = Guid.NewGuid(), NotificationId = readNotifId, UserId = userId, ReadAt = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var pushService = new CapturingPushNotificationService();
        var service = new NotificationService(db.Context, pushService, NullLogger<NotificationService>.Instance);

        // Act — creates a new unread notification, so unread count becomes 2 (unreadNotifId + new one)
        await service.CreateAsync(userId, "match", "New One", "body", "/feed", sendPush: true);

        Assert.Single(pushService.Sent);
        Assert.Equal(2, pushService.Sent[0].Payload.BadgeCount);
    }

    [Fact]
    public async Task CreateAsync_WithSendPushFalse_DoesNotSendPush()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var userId = await db.SeedUserAsync("no-push-user");

        var pushService = new CapturingPushNotificationService();
        var service = new NotificationService(db.Context, pushService, NullLogger<NotificationService>.Instance);

        await service.CreateAsync(userId, "match", "Title", "body", sendPush: false);

        Assert.Empty(pushService.Sent);
    }
}
