using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Commands.EndMatch;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Matches;

public class EndMatchHandlerTests
{
    private static EndMatchHandler BuildHandler(
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
            handler.Handle(new EndMatchCommand(Guid.NewGuid(), "unknown-auth-id"), CancellationToken.None));
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
            handler.Handle(new EndMatchCommand(Guid.NewGuid(), "coach-auth"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenCallerIsNotCoach_ThrowsForbiddenException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (_, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, status: MatchStatus.InProgress);
        await db.SeedUserAsync("non-coach-auth");
        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            handler.Handle(new EndMatchCommand(matchId, "non-coach-auth"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenCoachValid_SetsStatusToCompleted()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, status: MatchStatus.InProgress);
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new EndMatchCommand(matchId, "coach-auth"), CancellationToken.None);

        var match = await db.Context.Matches
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == matchId);
        Assert.Equal(MatchStatus.Completed, match!.Status);
    }

    [Fact]
    public async Task Handle_WhenPlayerAndCoachHaveUsers_SendsFullTimeNotificationsWithCorrectAudience()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, status: MatchStatus.InProgress);

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

        await handler.Handle(new EndMatchCommand(matchId, "coach-auth"), CancellationToken.None);

        Assert.Equal(2, fake.CreatedNotifications.Count);

        var playerNotif = Assert.Single(fake.CreatedNotifications, n => n.UserId == playerUserId);
        Assert.Equal("fulltime", playerNotif.Type);
        Assert.Equal("player", playerNotif.Audience);

        var coachNotif = Assert.Single(fake.CreatedNotifications, n => n.UserId == coachUserId);
        Assert.Equal("fulltime", coachNotif.Type);
        Assert.Equal("coach", coachNotif.Audience);
    }

    [Fact]
    public async Task Handle_WhenScoreAvailable_IncludesScoreInTitle()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.InProgress);

        var match = await db.Context.Matches.FindAsync(matchId);
        match!.HomeScore = 2;
        match.AwayScore = 1;
        await db.Context.SaveChangesAsync();

        var playerUserId = await db.SeedUserAsync("player-user");
        var playerId = await db.SeedPlayerAsync(clubId, userId: playerUserId);
        db.Context.MatchAttendances.Add(new MatchAttendance
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            PlayerId = playerId,
            Status = "invited"
        });

        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new EndMatchCommand(matchId, "coach-auth"), CancellationToken.None);

        var playerNotif = Assert.Single(fake.CreatedNotifications, n => n.Audience == "player");
        Assert.StartsWith("Full Time:", playerNotif.Title);
        Assert.Contains("2", playerNotif.Title);
        Assert.Contains("1", playerNotif.Title);
        Assert.Contains("Rivals FC", playerNotif.Title);
    }

    [Fact]
    public async Task Handle_WhenPenaltyGoalsExist_IncludesPenaltyCountsInTitle()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.InProgress);

        var match = await db.Context.Matches.FindAsync(matchId);
        match!.HomeScore = 1;
        match.AwayScore = 1;
        await db.Context.SaveChangesAsync();

        // Seed a MatchReport with penalty-period goals (home team wins 4-3 on pens)
        var reportId = Guid.NewGuid();
        db.Context.MatchReports.Add(new MatchReport { Id = reportId, MatchId = matchId });
        for (var i = 0; i < 4; i++)
            db.Context.Goals.Add(new Goal { Id = Guid.NewGuid(), MatchReportId = reportId, IsOpponent = false, Period = "penalties" });
        for (var i = 0; i < 3; i++)
            db.Context.Goals.Add(new Goal { Id = Guid.NewGuid(), MatchReportId = reportId, IsOpponent = true, Period = "penalties" });
        await db.Context.SaveChangesAsync();

        var playerUserId = await db.SeedUserAsync("player-user");
        var playerId = await db.SeedPlayerAsync(clubId, userId: playerUserId);
        db.Context.MatchAttendances.Add(new MatchAttendance
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            PlayerId = playerId,
            Status = "invited"
        });

        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new EndMatchCommand(matchId, "coach-auth"), CancellationToken.None);

        var playerNotif = Assert.Single(fake.CreatedNotifications, n => n.Audience == "player");
        Assert.Contains("(4)", playerNotif.Title);
        Assert.Contains("(3)", playerNotif.Title);
    }

    [Fact]
    public async Task Handle_WhenNoScoreAvailable_TitleShowsTeamNamesOnly()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.InProgress);

        var playerUserId = await db.SeedUserAsync("player-user");
        var playerId = await db.SeedPlayerAsync(clubId, userId: playerUserId);
        db.Context.MatchAttendances.Add(new MatchAttendance
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            PlayerId = playerId,
            Status = "invited"
        });

        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedTeamCoachAsync(teamId, coachId);
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(new EndMatchCommand(matchId, "coach-auth"), CancellationToken.None);

        var playerNotif = Assert.Single(fake.CreatedNotifications, n => n.Audience == "player");
        Assert.StartsWith("Full Time:", playerNotif.Title);
        Assert.DoesNotContain("–", playerNotif.Title);
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
