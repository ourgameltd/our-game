using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Commands.SendMatchNotification;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Matches;

public class SendMatchNotificationHandlerTests
{
    private static SendMatchNotificationHandler BuildHandler(
        TestDatabaseFactory db,
        INotificationService notificationService) =>
        new(db.Context, notificationService);

    [Fact]
    public async Task Handle_WhenMatchNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new SendMatchNotificationCommand(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNoRecipients_CompletesWithoutSendingNotifications()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (_, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new SendMatchNotificationCommand(matchId), CancellationToken.None);

        Assert.Empty(fake.CreatedNotifications);
    }

    [Fact]
    public async Task Handle_WhenPlayerAndCoachHaveUsers_SendsNotificationsWithCorrectAudience()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);

        var playerUserId = await db.SeedUserAsync("player-user");
        var playerId = await db.SeedPlayerAsync(clubId, userId: playerUserId);
        db.Context.MatchAttendances.Add(new MatchAttendance
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            PlayerId = playerId,
            Status = "invited"
        });

        var (coachId, coachUserId) = await db.SeedCoachAsync(clubId, "coach-user");
        await db.SeedTeamCoachAsync(teamId, coachId);
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new SendMatchNotificationCommand(matchId), CancellationToken.None);

        Assert.Equal(2, fake.CreatedNotifications.Count);

        var playerNotif = Assert.Single(fake.CreatedNotifications, n => n.UserId == playerUserId);
        Assert.Equal("match_reminder", playerNotif.Type);
        Assert.Equal("player", playerNotif.Audience);

        var coachNotif = Assert.Single(fake.CreatedNotifications, n => n.UserId == coachUserId);
        Assert.Equal("match_reminder", coachNotif.Type);
        Assert.Equal("coach", coachNotif.Audience);
    }

    [Fact]
    public async Task Handle_CoachWhoIsAlsoPlayer_ReceivesOnlyCoachNotification()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);

        var sharedUserId = await db.SeedUserAsync("coach-player-user");
        var playerId = await db.SeedPlayerAsync(clubId, userId: sharedUserId);
        db.Context.MatchAttendances.Add(new MatchAttendance
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            PlayerId = playerId,
            Status = "invited"
        });

        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        var coach = db.Context.Coaches.First(c => c.Id == coachId);
        coach.UserId = sharedUserId;
        await db.SeedTeamCoachAsync(teamId, coachId);
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new SendMatchNotificationCommand(matchId), CancellationToken.None);

        var notif = Assert.Single(fake.CreatedNotifications);
        Assert.Equal(sharedUserId, notif.UserId);
        Assert.Equal("coach", notif.Audience);
    }

    [Fact]
    public async Task Handle_DeduplicatesWhenPlayerAndParentShareUserId()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);

        var sharedUserId = await db.SeedUserAsync("shared-user");
        var playerId = await db.SeedPlayerAsync(clubId, userId: sharedUserId);
        db.Context.MatchAttendances.Add(new MatchAttendance
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            PlayerId = playerId,
            Status = "invited"
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

        await handler.Handle(new SendMatchNotificationCommand(matchId), CancellationToken.None);

        Assert.Single(fake.CreatedNotifications);
        Assert.Equal(sharedUserId, fake.CreatedNotifications[0].UserId);
        Assert.Equal("player", fake.CreatedNotifications[0].Audience);
    }

    // ── Fake infrastructure ───────────────────────────────────────────────

    private class FakeNotificationRecord
    {
        public Guid? UserId { get; init; }
        public string Type { get; init; } = "";
        public string? Audience { get; init; }
    }

    private class FakeNotificationService : INotificationService
    {
        public List<FakeNotificationRecord> CreatedNotifications { get; } = [];

        public Task<Notification> CreateAsync(
            Guid? userId,
            string type,
            string title,
            string message,
            string? url = null,
            bool sendPush = false,
            string? audience = null,
            CancellationToken cancellationToken = default)
        {
            CreatedNotifications.Add(new FakeNotificationRecord
            {
                UserId = userId,
                Type = type,
                Audience = audience
            });
            return Task.FromResult(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = type,
                Title = title,
                Message = message,
                Url = url,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}
