using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Teams;

public class GetTrainingSessionsByTeamIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsKeyNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetTrainingSessionsByTeamIdHandler(db.Context);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            handler.Handle(new GetTrainingSessionsByTeamIdQuery(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ReturnsSessions()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId, SessionStatus.Scheduled);

        var handler = new GetTrainingSessionsByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionsByTeamIdQuery(teamId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(result.Team);
        Assert.Equal(teamId, result.Team.Id);
        Assert.NotNull(result.Club);
        Assert.Equal(clubId, result.Club.Id);
        Assert.Single(result.Sessions);
        Assert.Equal(sessionId, result.Sessions[0].Id);
        Assert.Equal(1, result.TotalCount);
    }

    [Fact]
    public async Task Handle_WhenNoSessions_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        var handler = new GetTrainingSessionsByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionsByTeamIdQuery(teamId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(teamId, result.Team.Id);
        Assert.Empty(result.Sessions);
        Assert.Equal(0, result.TotalCount);
    }

    [Fact]
    public async Task Handle_AttendanceStatus_MapsPresenceBitCorrectly()
    {
        // Regression: SQL bit Present is cast to "0"/"1", not "True"/"False",
        // so bool.TryParse alone would return false for both values.
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId, SessionStatus.Completed);
        var player1 = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId);
        var player2 = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId);

        db.Context.SessionAttendances.AddRange(
            new SessionAttendance { Id = Guid.NewGuid(), SessionId = sessionId, PlayerId = player1, Present = true },
            new SessionAttendance { Id = Guid.NewGuid(), SessionId = sessionId, PlayerId = player2, Present = false }
        );
        await db.Context.SaveChangesAsync();

        var handler = new GetTrainingSessionsByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionsByTeamIdQuery(teamId), CancellationToken.None);

        var session = Assert.Single(result.Sessions);
        Assert.Equal(2, session.Attendance.Count);
        Assert.Contains(session.Attendance, a => a.PlayerId == player1 && a.Status == "confirmed");
        Assert.Contains(session.Attendance, a => a.PlayerId == player2 && a.Status == "declined");
    }
}
