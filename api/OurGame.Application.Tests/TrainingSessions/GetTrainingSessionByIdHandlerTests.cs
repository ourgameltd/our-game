using Microsoft.EntityFrameworkCore;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById;

namespace OurGame.Application.Tests.TrainingSessions;

public class GetTrainingSessionByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetTrainingSessionByIdHandler(db.Context);

        var result = await handler.Handle(new GetTrainingSessionByIdQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenExists_ReturnsMappedDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId: teamId);

        var handler = new GetTrainingSessionByIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionByIdQuery(sessionId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(sessionId, result.Id);
        Assert.Equal(teamId, result.TeamId);
        Assert.Equal(ageGroupId, result.AgeGroupId);
        Assert.Equal("Training Ground", result.Location);
        Assert.Null(result.TemplateId);
        Assert.Equal("scheduled", result.Status);
    }

    [Fact]
    public async Task Handle_IncludesDrills()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId: teamId);
        var drillId = await db.SeedDrillAsync();

        db.Context.SessionDrills.Add(new OurGame.Persistence.Models.SessionDrill
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            DrillId = drillId,
            Source = "manual",
            DrillOrder = 0
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTrainingSessionByIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionByIdQuery(sessionId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.Drills);
        Assert.Equal(drillId, result.Drills[0].DrillId);
        Assert.Equal("Passing Drill", result.Drills[0].DrillName);
        Assert.Equal("manual", result.Drills[0].Source);
    }

    [Fact]
    public async Task Handle_IncludesAttendance()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId: teamId);
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        db.Context.SessionAttendances.Add(new OurGame.Persistence.Models.SessionAttendance
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            PlayerId = playerId,
            Present = true,
            Notes = string.Empty
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTrainingSessionByIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionByIdQuery(sessionId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.Attendance);
        Assert.Equal(playerId, result.Attendance[0].PlayerId);
        Assert.Equal("confirmed", result.Attendance[0].Status);
    }

    [Fact]
    public async Task Handle_IncludesCoaches()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId: teamId);
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        db.Context.SessionCoaches.Add(new OurGame.Persistence.Models.SessionCoach
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            CoachId = coachId
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetTrainingSessionByIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionByIdQuery(sessionId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.Coaches);
        Assert.Equal(coachId, result.Coaches[0].CoachId);
    }

    [Fact]
    public async Task Handle_ParsesFocusAreas()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId: teamId);

        // Update the session to have focus areas
        var session = await db.Context.TrainingSessions.FindAsync(sessionId);
        Assert.NotNull(session);
        session!.FocusAreas = "[\"passing\",\"defending\"]";
        await db.Context.SaveChangesAsync();

        var handler = new GetTrainingSessionByIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionByIdQuery(sessionId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(new[] { "passing", "defending" }, result.FocusAreas);
    }

    [Fact]
    public async Task Handle_MapsAttendanceStatuses()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId: teamId);
        var player1 = await db.SeedPlayerAsync(clubId: clubId);
        var player2 = await db.SeedPlayerAsync(clubId: clubId);
        var player3 = await db.SeedPlayerAsync(clubId: clubId);

        // Make Present nullable to test attendance status mapping (confirmed/declined/pending)
        await db.Context.Database.ExecuteSqlRawAsync(
            "ALTER TABLE SessionAttendances ALTER COLUMN Present BIT NULL");

        // Insert via raw SQL: confirmed, declined, pending (null)
        var id1 = Guid.NewGuid();
        var id2 = Guid.NewGuid();
        var id3 = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO SessionAttendances (Id, Notes, PlayerId, PlayerId1, Present, SessionId) VALUES ({id1}, '', {player1}, NULL, 1, {sessionId})");
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO SessionAttendances (Id, Notes, PlayerId, PlayerId1, Present, SessionId) VALUES ({id2}, '', {player2}, NULL, 0, {sessionId})");
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO SessionAttendances (Id, Notes, PlayerId, PlayerId1, Present, SessionId) VALUES ({id3}, '', {player3}, NULL, NULL, {sessionId})");

        var handler = new GetTrainingSessionByIdHandler(db.Context);
        var result = await handler.Handle(new GetTrainingSessionByIdQuery(sessionId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(3, result.Attendance.Count);
        var statuses = result.Attendance.Select(a => a.Status).OrderBy(s => s).ToList();
        Assert.Contains("confirmed", statuses);
        Assert.Contains("declined", statuses);
        Assert.Contains("pending", statuses);
    }
}
