using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.TrainingSessions.Commands.UpdateMySessionAttendance;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.TrainingSessions;

public class UpdateMySessionAttendanceHandlerTests
{
    // ────────────────── Player ──────────────────

    [Fact]
    public async Task Handle_AsPlayer_UpdatesSessionAttendanceToConfirmed()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId);

        var userId = await db.SeedUserAsync("player-session-auth");
        var playerId = await db.SeedPlayerAsync(clubId, userId: userId);

        db.Context.SessionAttendances.Add(new SessionAttendance
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            PlayerId = playerId,
            Present = null, // pending
            Notes = string.Empty
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateMySessionAttendanceHandler(db.Context);
        await handler.Handle(new UpdateMySessionAttendanceCommand(sessionId, "player-session-auth", "confirmed"), CancellationToken.None);

        var record = await db.Context.SessionAttendances
            .AsNoTracking()
            .FirstAsync(a => a.SessionId == sessionId && a.PlayerId == playerId);
        Assert.True(record.Present);
    }

    [Fact]
    public async Task Handle_AsPlayer_UpdatesSessionAttendanceToDeclined()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId);

        var userId = await db.SeedUserAsync("player-session-auth-2");
        var playerId = await db.SeedPlayerAsync(clubId, userId: userId);

        db.Context.SessionAttendances.Add(new SessionAttendance
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            PlayerId = playerId,
            Present = null,
            Notes = string.Empty
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateMySessionAttendanceHandler(db.Context);
        await handler.Handle(new UpdateMySessionAttendanceCommand(sessionId, "player-session-auth-2", "declined"), CancellationToken.None);

        var record = await db.Context.SessionAttendances
            .AsNoTracking()
            .FirstAsync(a => a.SessionId == sessionId && a.PlayerId == playerId);
        Assert.False(record.Present);
    }

    // ────────────────── Coach ──────────────────

    [Fact]
    public async Task Handle_AsCoach_UpdatesSessionCoachStatusToConfirmed()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId);
        var (coachId, _) = await db.SeedCoachAsync(clubId, authId: "coach-session-auth");

        db.Context.SessionCoaches.Add(new SessionCoach
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            CoachId = coachId,
            Status = "pending",
            Notes = string.Empty
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateMySessionAttendanceHandler(db.Context);
        await handler.Handle(new UpdateMySessionAttendanceCommand(sessionId, "coach-session-auth", "confirmed"), CancellationToken.None);

        var record = await db.Context.SessionCoaches
            .AsNoTracking()
            .FirstAsync(c => c.SessionId == sessionId && c.CoachId == coachId);
        Assert.Equal("confirmed", record.Status);
    }

    // ────────────────── Parent ──────────────────

    [Fact]
    public async Task Handle_AsParent_WithLinkedChild_UpdatesChildAttendance()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId);

        var parentUserId = await db.SeedUserAsync("parent-session-auth");
        var childPlayerId = await db.SeedPlayerAsync(clubId, "Child", "Player");

        db.Context.EmergencyContacts.Add(new EmergencyContact
        {
            Id = Guid.NewGuid(),
            UserId = parentUserId,
            PlayerId = childPlayerId,
            Name = "Parent",
            Phone = "+44700000001",
            Email = "parent2@test.com",
            Relationship = "Parent",
            IsPrimary = true
        });
        db.Context.SessionAttendances.Add(new SessionAttendance
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            PlayerId = childPlayerId,
            Present = null,
            Notes = string.Empty
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateMySessionAttendanceHandler(db.Context);
        await handler.Handle(
            new UpdateMySessionAttendanceCommand(sessionId, "parent-session-auth", "confirmed", childPlayerId),
            CancellationToken.None);

        var record = await db.Context.SessionAttendances
            .AsNoTracking()
            .FirstAsync(a => a.SessionId == sessionId && a.PlayerId == childPlayerId);
        Assert.True(record.Present);
    }

    [Fact]
    public async Task Handle_AsParent_WithUnlinkedChild_ThrowsForbiddenException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId);

        var parentUserId = await db.SeedUserAsync("parent-unlinked-session-auth");
        var unlinkedPlayerId = await db.SeedPlayerAsync(clubId, "Other", "Player");

        var handler = new UpdateMySessionAttendanceHandler(db.Context);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            handler.Handle(
                new UpdateMySessionAttendanceCommand(sessionId, "parent-unlinked-session-auth", "confirmed", unlinkedPlayerId),
                CancellationToken.None));
    }

    // ────────────────── Not Found / Error cases ──────────────────

    [Fact]
    public async Task Handle_WhenPlayerHasNoAttendanceRecord_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId);

        var userId = await db.SeedUserAsync("no-attend-session-auth");
        await db.SeedPlayerAsync(clubId, userId: userId);

        var handler = new UpdateMySessionAttendanceHandler(db.Context);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateMySessionAttendanceCommand(sessionId, "no-attend-session-auth", "confirmed"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenUserNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (_, _, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId);

        var handler = new UpdateMySessionAttendanceHandler(db.Context);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateMySessionAttendanceCommand(sessionId, "ghost-session-auth", "confirmed"), CancellationToken.None));
    }
}
