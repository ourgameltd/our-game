using FluentValidation.TestHelper;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Commands.SendCardNotification;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Matches;

public class SendCardNotificationHandlerTests
{
    private static SendCardNotificationHandler BuildHandler(
        TestDatabaseFactory db,
        INotificationService notificationService) =>
        new(db.Context, notificationService);

    private static SendCardNotificationCommand ValidCommand(Guid matchId) =>
        new(matchId, "Alex Vale", "yellow", 32, "First Half", 2, 1);

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
        Assert.Equal("card", playerNotif.Type);
        Assert.Equal("player", playerNotif.Audience);

        var coachNotif = Assert.Single(fake.CreatedNotifications, n => n.UserId == coachUserId);
        Assert.Equal("card", coachNotif.Type);
        Assert.Equal("coach", coachNotif.Audience);
    }

    [Fact]
    public async Task Handle_FormatsTitleAndMessageCorrectly_ForYellowCard()
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

        var command = new SendCardNotificationCommand(matchId, "Alex Vale", "yellow", 32, "First Half", 2, 1);
        await handler.Handle(command, CancellationToken.None);

        var notif = Assert.Single(fake.CreatedNotifications);
        Assert.Equal("🟨 Yellow Card: Alex Vale", notif.Title);
        Assert.Contains("32'", notif.Message);
        Assert.Contains("First Half", notif.Message);
    }

    [Fact]
    public async Task Handle_FormatsTitleCorrectly_ForRedCard()
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

        var command = new SendCardNotificationCommand(matchId, "Alex Vale", "red", 55, "Second Half", 1, 1);
        await handler.Handle(command, CancellationToken.None);

        var notif = Assert.Single(fake.CreatedNotifications);
        Assert.Equal("🟥 Red Card: Alex Vale", notif.Title);
    }

    // ── Validator tests ────────────────────────────────────────────────────

    public class SendCardNotificationValidatorTests
    {
        private readonly SendCardNotificationValidator _validator = new();

        [Fact]
        public void Validate_WhenAllFieldsValid_Passes()
        {
            var result = _validator.TestValidate(new SendCardNotificationCommand(
                Guid.NewGuid(), "Alex Vale", "yellow", 45, "First Half", 2, 1));
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Fact]
        public void Validate_WhenMatchIdEmpty_Fails()
        {
            var result = _validator.TestValidate(new SendCardNotificationCommand(
                Guid.Empty, "Alex Vale", "yellow", 10, "First Half", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.MatchId);
        }

        [Fact]
        public void Validate_WhenPlayerNameEmpty_Fails()
        {
            var result = _validator.TestValidate(new SendCardNotificationCommand(
                Guid.NewGuid(), "", "yellow", 10, "First Half", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.PlayerName);
        }

        [Fact]
        public void Validate_WhenPlayerNameTooLong_Fails()
        {
            var result = _validator.TestValidate(new SendCardNotificationCommand(
                Guid.NewGuid(), new string('A', 201), "yellow", 10, "First Half", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.PlayerName);
        }

        [Fact]
        public void Validate_WhenCardTypeIsInvalid_Fails()
        {
            var result = _validator.TestValidate(new SendCardNotificationCommand(
                Guid.NewGuid(), "Alex Vale", "blue", 10, "First Half", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.CardType);
        }

        [Fact]
        public void Validate_WhenCardTypeIsRed_Passes()
        {
            var result = _validator.TestValidate(new SendCardNotificationCommand(
                Guid.NewGuid(), "Alex Vale", "red", 10, "First Half", 1, 0));
            result.ShouldNotHaveValidationErrorFor(x => x.CardType);
        }

        [Fact]
        public void Validate_WhenMinuteNegative_Fails()
        {
            var result = _validator.TestValidate(new SendCardNotificationCommand(
                Guid.NewGuid(), "Alex Vale", "yellow", -1, "First Half", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.Minute);
        }

        [Fact]
        public void Validate_WhenPeriodEmpty_Fails()
        {
            var result = _validator.TestValidate(new SendCardNotificationCommand(
                Guid.NewGuid(), "Alex Vale", "yellow", 10, "", 1, 0));
            result.ShouldHaveValidationErrorFor(x => x.Period);
        }

        [Fact]
        public void Validate_WhenHomeScoreNegative_Fails()
        {
            var result = _validator.TestValidate(new SendCardNotificationCommand(
                Guid.NewGuid(), "Alex Vale", "yellow", 10, "First Half", -1, 0));
            result.ShouldHaveValidationErrorFor(x => x.HomeScore);
        }

        [Fact]
        public void Validate_WhenAwayScoreNegative_Fails()
        {
            var result = _validator.TestValidate(new SendCardNotificationCommand(
                Guid.NewGuid(), "Alex Vale", "yellow", 10, "First Half", 0, -1));
            result.ShouldHaveValidationErrorFor(x => x.AwayScore);
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
