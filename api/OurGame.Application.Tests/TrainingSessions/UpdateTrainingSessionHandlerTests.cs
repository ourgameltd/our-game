using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.TrainingSessions.Commands.UpdateTrainingSession;
using OurGame.Application.UseCases.TrainingSessions.Commands.UpdateTrainingSession.DTOs;

namespace OurGame.Application.Tests.TrainingSessions;

public class UpdateTrainingSessionHandlerTests
{
    private static UpdateTrainingSessionRequest ValidDto(Guid teamId) => new()
    {
        TeamId = teamId,
        SessionDate = DateTime.UtcNow.AddDays(5),
        Location = "Updated Pitch",
        FocusAreas = new List<string> { "defending" },
        Category = "Scenario",
        Notes = "Updated notes",
        Status = "scheduled",
        IsLocked = false,
        Drills = new List<UpdateSessionDrillRequest>(),
        CoachIds = new List<Guid>(),
        Attendance = new List<UpdateSessionAttendanceRequest>(),
        AppliedTemplates = new List<UpdateAppliedTemplateRequest>()
    };

    [Fact]
    public async Task Handle_WhenSessionNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateTrainingSessionHandler(db.Context);
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateTrainingSessionCommand(Guid.NewGuid(), ValidDto(teamId)), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesAndReturnsDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId: teamId);

        var handler = new UpdateTrainingSessionHandler(db.Context);
        var result = await handler.Handle(
            new UpdateTrainingSessionCommand(sessionId, ValidDto(teamId)), CancellationToken.None);

        Assert.Equal(sessionId, result.Id);
        Assert.Equal("Updated Pitch", result.Location);
        Assert.Equal("Scenario", result.Category);
    }

    [Fact]
    public async Task Handle_WhenCategoryInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId: teamId);

        var handler = new UpdateTrainingSessionHandler(db.Context);
        var dto = ValidDto(teamId) with { Category = "Nope" };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateTrainingSessionCommand(sessionId, dto), CancellationToken.None));

        Assert.Contains("Category", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_ReplacesChildRecords()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId: teamId);
        var drill1 = await db.SeedDrillAsync(name: "Old Drill");
        var drill2 = await db.SeedDrillAsync(name: "New Drill");

        // Seed existing drill assignment
        db.Context.SessionDrills.Add(new OurGame.Persistence.Models.SessionDrill
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            DrillId = drill1,
            Source = "manual",
            DrillOrder = 0
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateTrainingSessionHandler(db.Context);
        var dto = ValidDto(teamId) with
        {
            Drills = new List<UpdateSessionDrillRequest>
            {
                new() { DrillId = drill2, Source = "manual", Order = 0 }
            }
        };

        var result = await handler.Handle(
            new UpdateTrainingSessionCommand(sessionId, dto), CancellationToken.None);

        Assert.Single(result.Drills);
        Assert.Equal(drill2, result.Drills[0].DrillId);
    }

    [Fact]
    public async Task Handle_WithAttendance_MapsStatuses()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var sessionId = await db.SeedTrainingSessionAsync(teamId: teamId);
        var player1 = await db.SeedPlayerAsync(clubId: clubId);
        var player2 = await db.SeedPlayerAsync(clubId: clubId);

        var handler = new UpdateTrainingSessionHandler(db.Context);
        var dto = ValidDto(teamId) with
        {
            Attendance = new List<UpdateSessionAttendanceRequest>
            {
                new() { PlayerId = player1, Status = "confirmed" },
                new() { PlayerId = player2, Status = "declined" }
            }
        };

        var result = await handler.Handle(
            new UpdateTrainingSessionCommand(sessionId, dto), CancellationToken.None);

        Assert.Equal(2, result.Attendance.Count);
        var statuses = result.Attendance.Select(a => a.Status).OrderBy(s => s).ToList();
        Assert.Contains("confirmed", statuses);
        Assert.Contains("declined", statuses);
    }
}
