using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Commands.StartMatch;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Matches;

public class StartMatchHandlerTests
{
    private static StartMatchHandler BuildHandler(
        TestDatabaseFactory db,
        INotificationService notificationService) =>
        new(db.Context, notificationService);

    [Fact]
    public async Task Handle_WhenUserNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new StartMatchCommand(Guid.NewGuid(), "unknown-auth-id"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenMatchNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, _) = await db.SeedClubWithTeamAsync();
        var (_, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new StartMatchCommand(Guid.NewGuid(), "coach-auth"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenCallerIsNotCoach_ThrowsForbiddenException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);
        await db.SeedUserAsync("non-coach-auth");
        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            handler.Handle(new StartMatchCommand(matchId, "non-coach-auth"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenCoachValid_SetsStatusToInProgress()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, status: MatchStatus.Scheduled);
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new StartMatchCommand(matchId, "coach-auth"), CancellationToken.None);

        var match = await db.Context.Matches
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == matchId);
        Assert.Equal(MatchStatus.InProgress, match!.Status);
    }

    [Fact]
    public async Task Handle_WhenNoRecipients_CompletesWithoutSendingNotifications()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new StartMatchCommand(matchId, "coach-auth"), CancellationToken.None);

        // Only the coach would get a notification here (no players/parents seeded)
        Assert.Single(fake.CreatedNotifications);
    }

    [Fact]
    public async Task Handle_WhenPlayerAndCoachHaveUsers_SendsKickOffNotificationsWithCorrectAudience()
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

        var (coachId, coachUserId) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new StartMatchCommand(matchId, "coach-auth"), CancellationToken.None);

        Assert.Equal(2, fake.CreatedNotifications.Count);

        var playerNotif = Assert.Single(fake.CreatedNotifications, n => n.UserId == playerUserId);
        Assert.Equal("kickoff", playerNotif.Type);
        Assert.Equal("player", playerNotif.Audience);

        var coachNotif = Assert.Single(fake.CreatedNotifications, n => n.UserId == coachUserId);
        Assert.Equal("kickoff", coachNotif.Type);
        Assert.Equal("coach", coachNotif.Audience);
    }

    [Fact]
    public async Task Handle_NotificationTitleIncludesTeamNames()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC");

        var playerUserId = await db.SeedUserAsync("player-user");
        var playerId = await db.SeedPlayerAsync(clubId, userId: playerUserId);
        db.Context.MatchAttendances.Add(new MatchAttendance
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            PlayerId = playerId,
            Status = "invited"
        });
        await db.Context.SaveChangesAsync();

        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new StartMatchCommand(matchId, "coach-auth"), CancellationToken.None);

        var playerNotif = Assert.Single(fake.CreatedNotifications, n => n.Audience == "player");
        Assert.StartsWith("Kick Off!", playerNotif.Title);
        Assert.Contains("Rivals FC", playerNotif.Title);
        Assert.Contains("Home Ground", playerNotif.Message);
    }

    // ── Fake infrastructure ───────────────────────────────────────────────

    private class FakeNotificationRecord
    {
        public Guid? UserId { get; init; }
        public string Type { get; init; } = "";
        public string Title { get; init; } = "";
        public string Message { get; init; } = "";
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
                Title = title,
                Message = message,
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
