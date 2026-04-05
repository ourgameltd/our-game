using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Services;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Invites.Commands.CreateInvite;
using OurGame.Application.UseCases.Invites.Commands.CreateInvite.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Invites;

public class CreateInviteHandlerTests
{
    private static CreateInviteHandler BuildHandler(
        OurGameContext db,
        IEmailService? emailService = null,
        ILogger<CreateInviteHandler>? logger = null)
    {
        return new CreateInviteHandler(
            db,
            emailService ?? new StubEmailService(true),
            logger ?? NullLogger<CreateInviteHandler>.Instance);
    }

    // ──────────────────────────────────────────────
    //  Success paths
    // ──────────────────────────────────────────────

    [Fact]
    public async Task CreateInvite_ForCoach_PersistsInviteAndSendsEmail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, _) = await db.SeedClubWithTeamAsync();

        // Create a coach WITHOUT a linked user (eligible for invite)
        var coachId = Guid.NewGuid();
        db.Context.Coaches.Add(new Coach
        {
            Id = coachId,
            ClubId = clubId,
            UserId = null,
            FirstName = "Unlinked",
            LastName = "Coach",
            Role = CoachRole.HeadCoach,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        // Create the sending user
        await db.SeedUserAsync("sender-auth");

        var emailService = new StubEmailService(true);
        var handler = BuildHandler(db.Context, emailService);

        var command = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "coach@example.com",
            Type = InviteType.Coach,
            EntityId = coachId,
            ClubId = clubId
        });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal("coach@example.com", result.Email);
        Assert.Equal(InviteType.Coach, result.Type);
        Assert.Equal(coachId, result.EntityId);
        Assert.Equal(clubId, result.ClubId);
        Assert.Equal(InviteStatus.Pending, result.Status);
        Assert.NotEmpty(result.Code);

        // Verify persisted
        var dbInvite = await db.Context.Invites.SingleAsync(i => i.Id == result.Id);
        Assert.Equal("coach@example.com", dbInvite.Email);
        Assert.Equal(InviteStatus.Pending, dbInvite.Status);

        // Verify email was dispatched
        Assert.Single(emailService.SentEmails);
        Assert.Equal("coach@example.com", emailService.SentEmails[0].RecipientEmail);
        Assert.Equal("Coach", emailService.SentEmails[0].RoleName);
    }

    [Fact]
    public async Task CreateInvite_ForPlayer_PersistsInvite()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, _) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId);

        await db.SeedUserAsync("sender-auth");

        var emailService = new StubEmailService(true);
        var handler = BuildHandler(db.Context, emailService);

        var command = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "player@example.com",
            Type = InviteType.Player,
            EntityId = playerId,
            ClubId = clubId
        });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(InviteType.Player, result.Type);
        Assert.Equal(playerId, result.EntityId);
        Assert.Single(emailService.SentEmails);
        Assert.Equal("Player", emailService.SentEmails[0].RoleName);
    }

    [Fact]
    public async Task CreateInvite_ForGuardian_PersistsInvite()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, _) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId);

        await db.SeedUserAsync("sender-auth");

        var emailService = new StubEmailService(true);
        var handler = BuildHandler(db.Context, emailService);

        var command = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "parent@example.com",
            Type = InviteType.Parent,
            EntityId = playerId,
            ClubId = clubId
        });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(InviteType.Parent, result.Type);
        Assert.Single(emailService.SentEmails);
        Assert.Equal("Guardian", emailService.SentEmails[0].RoleName);
    }

    [Fact]
    public async Task CreateInvite_OpenInvite_UsesSystemPlaceholderEmailAndNoDuplicates()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, _) = await db.SeedClubWithTeamAsync();
        await db.SeedUserAsync("sender-auth");

        var emailService = new StubEmailService(true);
        var handler = BuildHandler(db.Context, emailService);

        var command = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "anything@ignored.com",
            Type = InviteType.Player,
            EntityId = ageGroupId,
            ClubId = clubId,
            IsOpenInvite = true
        });

        var result = await handler.Handle(command, CancellationToken.None);
        Assert.Equal("open-invite@ourgame.local", result.Email);
        Assert.True(result.IsOpenInvite);

        var duplicate = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "different@ignored.com",
            Type = InviteType.Player,
            EntityId = ageGroupId,
            ClubId = clubId,
            IsOpenInvite = true
        });

        await Assert.ThrowsAsync<ValidationException>(() => handler.Handle(duplicate, CancellationToken.None));
    }

    // ──────────────────────────────────────────────
    //  Email failure resilience
    // ──────────────────────────────────────────────

    [Fact]
    public async Task CreateInvite_WhenEmailFails_StillPersistsInvite()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, _) = await db.SeedClubWithTeamAsync();

        var coachId = Guid.NewGuid();
        db.Context.Coaches.Add(new Coach
        {
            Id = coachId,
            ClubId = clubId,
            UserId = null,
            FirstName = "Fail",
            LastName = "Email",
            Role = CoachRole.AssistantCoach,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        await db.SeedUserAsync("sender-auth");

        // Email service returns false (delivery failure)
        var emailService = new StubEmailService(false);
        var handler = BuildHandler(db.Context, emailService);

        var command = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "fail@example.com",
            Type = InviteType.Coach,
            EntityId = coachId,
            ClubId = clubId
        });

        var result = await handler.Handle(command, CancellationToken.None);

        // Invite persisted despite email failure
        var dbInvite = await db.Context.Invites.SingleAsync(i => i.Id == result.Id);
        Assert.Equal(InviteStatus.Pending, dbInvite.Status);
        Assert.Equal("fail@example.com", dbInvite.Email);

        // Email was attempted
        Assert.Single(emailService.SentEmails);
    }

    // ──────────────────────────────────────────────
    //  Validation failures
    // ──────────────────────────────────────────────

    [Fact]
    public async Task CreateInvite_WhenSenderNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = BuildHandler(db.Context);

        var command = new CreateInviteCommand("non-existent-auth", new CreateInviteRequestDto
        {
            Email = "test@example.com",
            Type = InviteType.Coach,
            EntityId = Guid.NewGuid(),
            ClubId = Guid.NewGuid()
        });

        await Assert.ThrowsAsync<NotFoundException>(
            () => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task CreateInvite_WhenCoachNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, _) = await db.SeedClubWithTeamAsync();
        await db.SeedUserAsync("sender-auth");

        var handler = BuildHandler(db.Context);

        var command = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "test@example.com",
            Type = InviteType.Coach,
            EntityId = Guid.NewGuid(), // Non-existent coach
            ClubId = clubId
        });

        await Assert.ThrowsAsync<NotFoundException>(
            () => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task CreateInvite_WhenCoachAlreadyLinked_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, _) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId, "coach-auth");
        await db.SeedUserAsync("sender-auth");

        var handler = BuildHandler(db.Context);

        var command = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "test@example.com",
            Type = InviteType.Coach,
            EntityId = coachId,
            ClubId = clubId
        });

        var ex = await Assert.ThrowsAsync<ValidationException>(
            () => handler.Handle(command, CancellationToken.None));
        Assert.True(ex.Errors.ContainsKey("EntityId"));
    }

    [Fact]
    public async Task CreateInvite_WhenDuplicatePendingExists_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, _) = await db.SeedClubWithTeamAsync();

        var coachId = Guid.NewGuid();
        db.Context.Coaches.Add(new Coach
        {
            Id = coachId,
            ClubId = clubId,
            UserId = null,
            FirstName = "Dup",
            LastName = "Coach",
            Role = CoachRole.HeadCoach,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        await db.SeedUserAsync("sender-auth");

        var handler = BuildHandler(db.Context);

        // Create first invite
        var firstCommand = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "dup@example.com",
            Type = InviteType.Coach,
            EntityId = coachId,
            ClubId = clubId
        });
        await handler.Handle(firstCommand, CancellationToken.None);

        // Attempt duplicate
        var duplicateCommand = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "dup@example.com",
            Type = InviteType.Coach,
            EntityId = coachId,
            ClubId = clubId
        });

        var ex = await Assert.ThrowsAsync<ValidationException>(
            () => handler.Handle(duplicateCommand, CancellationToken.None));
        Assert.True(ex.Errors.ContainsKey("Email"));
    }

    [Fact]
    public async Task CreateInvite_WhenClubNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, _) = await db.SeedClubWithTeamAsync();

        var coachId = Guid.NewGuid();
        db.Context.Coaches.Add(new Coach
        {
            Id = coachId,
            ClubId = clubId,
            UserId = null,
            FirstName = "No",
            LastName = "Club",
            Role = CoachRole.HeadCoach,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        await db.SeedUserAsync("sender-auth");

        var handler = BuildHandler(db.Context);

        var command = new CreateInviteCommand("sender-auth", new CreateInviteRequestDto
        {
            Email = "test@example.com",
            Type = InviteType.Coach,
            EntityId = coachId,
            ClubId = Guid.NewGuid() // Non-existent club
        });

        await Assert.ThrowsAsync<NotFoundException>(
            () => handler.Handle(command, CancellationToken.None));
    }

    // ──────────────────────────────────────────────
    //  Stub email service for testing
    // ──────────────────────────────────────────────

    private sealed class StubEmailService : IEmailService
    {
        private readonly bool _succeeds;

        public List<SentEmail> SentEmails { get; } = new();

        public StubEmailService(bool succeeds) => _succeeds = succeeds;

        public Task<bool> SendInviteEmailAsync(
            string recipientEmail,
            string recipientName,
            string clubName,
            string roleName,
            string inviteCode,
            CancellationToken cancellationToken = default)
        {
            SentEmails.Add(new SentEmail(recipientEmail, recipientName, clubName, roleName, inviteCode));
            return Task.FromResult(_succeeds);
        }

        public record SentEmail(string RecipientEmail, string RecipientName, string ClubName, string RoleName, string InviteCode);
    }
}
