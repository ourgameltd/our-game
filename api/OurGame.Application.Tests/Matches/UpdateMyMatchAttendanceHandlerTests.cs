using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Commands.UpdateMyMatchAttendance;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Matches;

public class UpdateMyMatchAttendanceHandlerTests
{
    // ────────────────── Player ──────────────────

    [Fact]
    public async Task Handle_AsPlayer_UpdatesMatchAttendanceToConfirmed()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);

        var userId = await db.SeedUserAsync("player-auth");
        var playerId = await db.SeedPlayerAsync(clubId, userId: userId);

        db.Context.MatchAttendances.Add(new MatchAttendance
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            PlayerId = playerId,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateMyMatchAttendanceHandler(db.Context);
        await handler.Handle(new UpdateMyMatchAttendanceCommand(matchId, "player-auth", "confirmed"), CancellationToken.None);

        var record = await db.Context.MatchAttendances
            .AsNoTracking()
            .FirstAsync(a => a.MatchId == matchId && a.PlayerId == playerId);
        Assert.Equal("confirmed", record.Status);
    }

    [Fact]
    public async Task Handle_AsPlayer_UpdatesMatchAttendanceToDeclined()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);

        var userId = await db.SeedUserAsync("player-auth-2");
        var playerId = await db.SeedPlayerAsync(clubId, userId: userId);

        db.Context.MatchAttendances.Add(new MatchAttendance
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            PlayerId = playerId,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateMyMatchAttendanceHandler(db.Context);
        await handler.Handle(new UpdateMyMatchAttendanceCommand(matchId, "player-auth-2", "declined"), CancellationToken.None);

        var record = await db.Context.MatchAttendances
            .AsNoTracking()
            .FirstAsync(a => a.MatchId == matchId && a.PlayerId == playerId);
        Assert.Equal("declined", record.Status);
    }

    // ────────────────── Coach ──────────────────

    [Fact]
    public async Task Handle_AsCoach_UpdatesMatchCoachStatusToConfirmed()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);
        var (coachId, _) = await db.SeedCoachAsync(clubId, authId: "coach-auth");

        db.Context.MatchCoaches.Add(new MatchCoach
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            CoachId = coachId,
            Status = "pending",
            Notes = string.Empty
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateMyMatchAttendanceHandler(db.Context);
        await handler.Handle(new UpdateMyMatchAttendanceCommand(matchId, "coach-auth", "confirmed"), CancellationToken.None);

        var record = await db.Context.MatchCoaches
            .AsNoTracking()
            .FirstAsync(c => c.MatchId == matchId && c.CoachId == coachId);
        Assert.Equal("confirmed", record.Status);
    }

    // ────────────────── Parent ──────────────────

    [Fact]
    public async Task Handle_AsParent_WithLinkedChild_UpdatesChildAttendance()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);

        var parentUserId = await db.SeedUserAsync("parent-auth");
        var childPlayerId = await db.SeedPlayerAsync(clubId, "Child", "Player");

        db.Context.EmergencyContacts.Add(new EmergencyContact
        {
            Id = Guid.NewGuid(),
            UserId = parentUserId,
            PlayerId = childPlayerId,
            Name = "Parent",
            Phone = "+44700000000",
            Email = "parent@test.com",
            Relationship = "Parent",
            IsPrimary = true
        });
        db.Context.MatchAttendances.Add(new MatchAttendance
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            PlayerId = childPlayerId,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateMyMatchAttendanceHandler(db.Context);
        await handler.Handle(
            new UpdateMyMatchAttendanceCommand(matchId, "parent-auth", "confirmed", childPlayerId),
            CancellationToken.None);

        var record = await db.Context.MatchAttendances
            .AsNoTracking()
            .FirstAsync(a => a.MatchId == matchId && a.PlayerId == childPlayerId);
        Assert.Equal("confirmed", record.Status);
    }

    [Fact]
    public async Task Handle_AsParent_WithUnlinkedChild_ThrowsForbiddenException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);

        var parentUserId = await db.SeedUserAsync("parent-unlinked-auth");
        var unlinkedPlayerId = await db.SeedPlayerAsync(clubId, "Other", "Player");

        var handler = new UpdateMyMatchAttendanceHandler(db.Context);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            handler.Handle(
                new UpdateMyMatchAttendanceCommand(matchId, "parent-unlinked-auth", "confirmed", unlinkedPlayerId),
                CancellationToken.None));
    }

    // ────────────────── Not Found / Error cases ──────────────────

    [Fact]
    public async Task Handle_WhenPlayerHasNoAttendanceRecord_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);

        var userId = await db.SeedUserAsync("no-attend-auth");
        await db.SeedPlayerAsync(clubId, userId: userId);

        var handler = new UpdateMyMatchAttendanceHandler(db.Context);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateMyMatchAttendanceCommand(matchId, "no-attend-auth", "confirmed"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenUserNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (_, _, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId);

        var handler = new UpdateMyMatchAttendanceHandler(db.Context);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateMyMatchAttendanceCommand(matchId, "ghost-auth", "confirmed"), CancellationToken.None));
    }
}
