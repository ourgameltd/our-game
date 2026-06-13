using FluentValidation.TestHelper;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Commands.SendGoalNotification;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Matches;

public class SendGoalNotificationHandlerTests
{
    private static SendGoalNotificationHandler BuildHandler(
        TestDatabaseFactory db,
        INotificationService notificationService) =>
        new(db.Context, notificationService);

    private static SendGoalNotificationCommand ValidCommand(Guid matchId) =>
        new(matchId, "Alex Vale", 32, "First Half", 2, 1);

    // ── Handler tests ──────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenMatchNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(ValidCommand(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNoRecipients_CompletesWithoutSendingNotifications()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (_, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.InProgress);

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(ValidCommand(matchId), CancellationToken.None);

        Assert.Empty(fake.CreatedNotifications);
    }

    [Fact]
    public async Task Handle_WhenPlayerAndCoachHaveUsers_SendsNotificationsWithCorrectAudience()
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

        var (coachId, coachUserId) = await db.SeedCoachAsync(clubId, "coach-user");
        await db.SeedTeamCoachAsync(teamId, coachId);
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(ValidCommand(matchId), CancellationToken.None);

        Assert.Equal(2, fake.CreatedNotifications.Count);

        var playerNotif = Assert.Single(fake.CreatedNotifications, n => n.UserId == playerUserId);
        Assert.Equal("goal", playerNotif.Type);
        Assert.Equal("player", playerNotif.Audience);

        var coachNotif = Assert.Single(fake.CreatedNotifications, n => n.UserId == coachUserId);
        Assert.Equal("goal", coachNotif.Type);
        Assert.Equal("coach", coachNotif.Audience);
    }

    [Fact]
    public async Task Handle_CoachWhoIsAlsoPlayer_ReceivesOnlyCoachNotification()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.InProgress);

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
        // Manually assign the shared user to the coach entity
        var coach = db.Context.Coaches.First(c => c.Id == coachId);
        coach.UserId = sharedUserId;
        await db.SeedTeamCoachAsync(teamId, coachId);
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        await handler.Handle(ValidCommand(matchId), CancellationToken.None);

        var notif = Assert.Single(fake.CreatedNotifications);
        Assert.Equal(sharedUserId, notif.UserId);
        Assert.Equal("coach", notif.Audience);
    }

    [Fact]
    public async Task Handle_FormatsTitleAndMessageCorrectly()
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
        await db.Context.SaveChangesAsync();

        var fake = new FakeNotificationService();
        var handler = BuildHandler(db, fake);

        var command = new SendGoalNotificationCommand(matchId, "Alex Vale", 32, "First Half", 2, 1);
        await handler.Handle(command, CancellationToken.None);

        var notif = Assert.Single(fake.CreatedNotifications);
        Assert.Equal("GOAL! Alex Vale", notif.Title);
        Assert.Contains("32'", notif.Message);
        Assert.Contains("First Half", notif.Message);
        Assert.Contains("2", notif.Message);
        Assert.Contains("1", notif.Message);
    }

    [Fact]
    public async Task Handle_DeduplicatesWhenPlayerAndParentShareUserId()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.InProgress);

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

        await handler.Handle(ValidCommand(matchId), CancellationToken.None);

        Assert.Single(fake.CreatedNotifications);
        Assert.Equal(sharedUserId, fake.CreatedNotifications[0].UserId);
    }

    // ── Validator tests ────────────────────────────────────────────────────

    public class SendGoalNotificationValidatorTests
    {
        private readonly SendGoalNotificationValidator _validator = new();

        [Fact]
        public void Validate_WhenAllFieldsValid_Passes()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.NewGuid(), "Alex Vale", 45, "First Half", 2, 1));
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Fact]
        public void Validate_WhenMatchIdEmpty_Fails()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.Empty, "Alex Vale", 10, "First Half", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.MatchId);
        }

        [Fact]
        public void Validate_WhenScorerNameEmpty_Fails()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.NewGuid(), "", 10, "First Half", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.ScorerName);
        }

        [Fact]
        public void Validate_WhenScorerNameTooLong_Fails()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.NewGuid(), new string('A', 201), 10, "First Half", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.ScorerName);
        }

        [Fact]
        public void Validate_WhenMinuteNegative_Fails()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.NewGuid(), "Alex Vale", -1, "First Half", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.Minute);
        }

        [Fact]
        public void Validate_WhenPeriodEmpty_Fails()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.NewGuid(), "Alex Vale", 10, "", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.Period);
        }

        [Fact]
        public void Validate_WhenPeriodTooLong_Fails()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.NewGuid(), "Alex Vale", 10, new string('X', 51), 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.Period);
        }

        [Fact]
        public void Validate_WhenHomeScoreNegative_Fails()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.NewGuid(), "Alex Vale", 10, "First Half", -1, 0));
            result.ShouldHaveValidationErrorFor(x => x.HomeScore);
        }

        [Fact]
        public void Validate_WhenAwayScoreNegative_Fails()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.NewGuid(), "Alex Vale", 10, "First Half", 0, -1));
            result.ShouldHaveValidationErrorFor(x => x.AwayScore);
        }

        [Fact]
        public void Validate_WhenMinuteIsZero_Passes()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.NewGuid(), "Alex Vale", 0, "First Half", 1, 0));
            result.ShouldNotHaveValidationErrorFor(x => x.Minute);
        }

        [Fact]
        public void Validate_WhenBothScoresAreZero_Passes()
        {
            var result = _validator.TestValidate(new SendGoalNotificationCommand(
                Guid.NewGuid(), "Alex Vale", 1, "First Half", 0, 0));
            result.ShouldNotHaveAnyValidationErrors();
        }
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
