using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Invites;
using OurGame.Application.UseCases.Invites.Commands.RegenerateInvite;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Invites;

public class RegenerateInviteHandlerTests
{
    private static RegenerateInviteHandler BuildHandler(OurGameContext db)
    {
        return new RegenerateInviteHandler(db);
    }

    // ──────────────────────────────────────────────
    //  Success paths
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Regenerate_PendingInvite_RevokesOldAndCreatesNew()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, _) = await db.SeedClubWithTeamAsync();
        var userId = await db.SeedUserAsync("sender-auth");

        var oldInvite = new Invite
        {
            Id = Guid.NewGuid(),
            Code = "OLDCODE1",
            Email = InviteConstants.OpenInviteEmail,
            Type = InviteType.Player,
            EntityId = ageGroupId,
            ClubId = clubId,
            Status = InviteStatus.Pending,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            ExpiresAt = DateTime.UtcNow.AddDays(25)
        };
        db.Context.Invites.Add(oldInvite);
        await db.Context.SaveChangesAsync();

        var handler = BuildHandler(db.Context);
        var command = new RegenerateInviteCommand(oldInvite.Id, "sender-auth");

        var result = await handler.Handle(command, CancellationToken.None);

        // New invite created with different code
        Assert.NotEqual("OLDCODE1", result.Code);
        Assert.Equal(InviteType.Player, result.Type);
        Assert.Equal(ageGroupId, result.EntityId);
        Assert.Equal(clubId, result.ClubId);
        Assert.Equal(InviteStatus.Pending, result.Status);
        Assert.True(result.IsOpenInvite);

        // Old invite revoked
        var revokedInvite = await db.Context.Invites.FirstAsync(i => i.Id == oldInvite.Id);
        Assert.Equal(InviteStatus.Revoked, revokedInvite.Status);

        // New invite persisted
        var newInvite = await db.Context.Invites.FirstAsync(i => i.Id == result.Id);
        Assert.Equal(InviteStatus.Pending, newInvite.Status);
        Assert.Equal(InviteConstants.OpenInviteEmail, newInvite.Email);
    }

    [Fact]
    public async Task Regenerate_PreservesInviteProperties()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, _) = await db.SeedClubWithTeamAsync();
        var userId = await db.SeedUserAsync("sender-auth");

        var oldInvite = new Invite
        {
            Id = Guid.NewGuid(),
            Code = "COACH123",
            Email = InviteConstants.OpenInviteEmail,
            Type = InviteType.Coach,
            EntityId = ageGroupId,
            ClubId = clubId,
            Status = InviteStatus.Pending,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            ExpiresAt = DateTime.UtcNow.AddDays(20)
        };
        db.Context.Invites.Add(oldInvite);
        await db.Context.SaveChangesAsync();

        var handler = BuildHandler(db.Context);
        var result = await handler.Handle(new RegenerateInviteCommand(oldInvite.Id, "sender-auth"), CancellationToken.None);

        // Same type, entity, club, email
        Assert.Equal(oldInvite.Type, result.Type);
        Assert.Equal(oldInvite.EntityId, result.EntityId);
        Assert.Equal(oldInvite.ClubId, result.ClubId);
        Assert.Equal(oldInvite.Email, result.Email);

        // New expiry is 30 days from now (not from old invite)
        Assert.True(result.ExpiresAt > DateTime.UtcNow.AddDays(29));
    }

    // ──────────────────────────────────────────────
    //  Validation failures
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Regenerate_NonPendingInvite_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, _) = await db.SeedClubWithTeamAsync();
        var userId = await db.SeedUserAsync("sender-auth");

        var revokedInvite = new Invite
        {
            Id = Guid.NewGuid(),
            Code = "REVOKED1",
            Email = InviteConstants.OpenInviteEmail,
            Type = InviteType.Player,
            EntityId = ageGroupId,
            ClubId = clubId,
            Status = InviteStatus.Revoked,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            ExpiresAt = DateTime.UtcNow.AddDays(25)
        };
        db.Context.Invites.Add(revokedInvite);
        await db.Context.SaveChangesAsync();

        var handler = BuildHandler(db.Context);

        await Assert.ThrowsAsync<ValidationException>(
            () => handler.Handle(new RegenerateInviteCommand(revokedInvite.Id, "sender-auth"), CancellationToken.None));
    }

    [Fact]
    public async Task Regenerate_NonExistentInvite_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("sender-auth");

        var handler = BuildHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(
            () => handler.Handle(new RegenerateInviteCommand(Guid.NewGuid(), "sender-auth"), CancellationToken.None));
    }

    [Fact]
    public async Task Regenerate_NonExistentUser_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, _) = await db.SeedClubWithTeamAsync();
        var userId = await db.SeedUserAsync("sender-auth");

        var invite = new Invite
        {
            Id = Guid.NewGuid(),
            Code = "NOUSER01",
            Email = InviteConstants.OpenInviteEmail,
            Type = InviteType.Player,
            EntityId = ageGroupId,
            ClubId = clubId,
            Status = InviteStatus.Pending,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };
        db.Context.Invites.Add(invite);
        await db.Context.SaveChangesAsync();

        var handler = BuildHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(
            () => handler.Handle(new RegenerateInviteCommand(invite.Id, "non-existent-auth"), CancellationToken.None));
    }
}
