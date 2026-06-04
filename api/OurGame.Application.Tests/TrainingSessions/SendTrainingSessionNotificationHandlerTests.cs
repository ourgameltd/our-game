using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.TrainingSessions.Commands.SendTrainingSessionNotification;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.TrainingSessions;

public class SendTrainingSessionNotificationHandlerTests
{
    private static SendTrainingSessionNotificationHandler BuildHandler(
        TestDatabaseFactory db,
        INotificationService notificationService) =>
        new(db.Context, notificationService);

    [Fact]
    public async Task Handle_WhenSessionNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new SendTrainingSessionNotificationCommand(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNoRecipients_CompletesWithoutSendingNotifications()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (_, _, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId);

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new SendTrainingSessionNotificationCommand(sessionId), CancellationToken.None);

        Assert.Empty(fake.CreatedNotifications);
    }

    [Fact]
    public async Task Handle_WhenPlayerAndCoachHaveUsers_SendsNotificationToEach()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId);

        var playerUserId = await db.SeedUserAsync("player-user");
        var playerId = await db.SeedPlayerAsync(clubId, userId: playerUserId);
        db.Context.SessionAttendances.Add(new SessionAttendance
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            PlayerId = playerId
        });

        var (coachId, coachUserId) = await db.SeedCoachAsync(clubId, "coach-user");
        db.Context.SessionCoaches.Add(new SessionCoach
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            CoachId = coachId,
            Status = "confirmed",
            Notes = string.Empty
        });
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new SendTrainingSessionNotificationCommand(sessionId), CancellationToken.None);

        Assert.Equal(2, fake.CreatedNotifications.Count);
        Assert.Contains(fake.CreatedNotifications, n => n.UserId == playerUserId);
        Assert.Contains(fake.CreatedNotifications, n => n.UserId == coachUserId);
        Assert.All(fake.CreatedNotifications, n => Assert.Equal("training_session_reminder", n.Type));
    }

    [Fact]
    public async Task Handle_DeduplicatesWhenPlayerAndParentShareUserId()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId);

        var sharedUserId = await db.SeedUserAsync("shared-user");
        var playerId = await db.SeedPlayerAsync(clubId, userId: sharedUserId);
        db.Context.SessionAttendances.Add(new SessionAttendance
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            PlayerId = playerId
        });
        db.Context.EmergencyContacts.Add(new EmergencyContact
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            UserId = sharedUserId,
            Name = "Parent",
            Relationship = "Parent"
        });
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new SendTrainingSessionNotificationCommand(sessionId), CancellationToken.None);

        Assert.Single(fake.CreatedNotifications);
        Assert.Equal(sharedUserId, fake.CreatedNotifications[0].UserId);
    }

    private class FakeNotificationService : INotificationService
    {
        public List<Notification> CreatedNotifications { get; } = [];

        public Task<Notification> CreateAsync(
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
            CreatedNotifications.Add(notification);
            return Task.FromResult(notification);
        }
    }
}
