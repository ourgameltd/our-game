using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession;
using OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession.DTOs;

namespace OurGame.Application.Tests.TrainingSessions;

public class CreateTrainingSessionHandlerTests
{
    private static CreateTrainingSessionDto ValidDto(Guid teamId) => new()
    {
        TeamId = teamId,
        SessionDate = DateTime.UtcNow.AddDays(7),
        Location = "Main Pitch",
        FocusAreas = new List<string> { "passing" },
        Notes = "Bring water",
        Status = "scheduled",
        IsLocked = false,
        SessionDrills = new List<CreateSessionDrillDto>(),
        AssignedCoachIds = new List<Guid>(),
        Attendance = new List<CreateSessionAttendanceDto>(),
        AppliedTemplates = new List<CreateAppliedTemplateDto>()
    };

    [Fact]
    public async Task Handle_WhenTeamIdEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateTrainingSessionHandler(db.Context);

        var dto = ValidDto(Guid.Empty) with { TeamId = Guid.Empty };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateTrainingSessionCommand(dto), CancellationToken.None));
        Assert.Contains("TeamId", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenLocationEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateTrainingSessionHandler(db.Context);

        var dto = ValidDto(Guid.NewGuid()) with { Location = "  " };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateTrainingSessionCommand(dto), CancellationToken.None));
        Assert.Contains("Location", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateTrainingSessionHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new CreateTrainingSessionCommand(ValidDto(Guid.NewGuid())), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesAndReturnsDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        var handler = new CreateTrainingSessionHandler(db.Context);
        var dto = ValidDto(teamId);

        var result = await handler.Handle(new CreateTrainingSessionCommand(dto), CancellationToken.None);

        Assert.Equal(teamId, result.TeamId);
        Assert.Equal("Main Pitch", result.Location);
        Assert.Equal("scheduled", result.Status);
    }

    [Fact]
    public async Task Handle_WithDrillsAndCoaches_CreatesChildRecords()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var drillId = await db.SeedDrillAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);

        var handler = new CreateTrainingSessionHandler(db.Context);
        var dto = ValidDto(teamId) with
        {
            SessionDrills = new List<CreateSessionDrillDto>
            {
                new() { DrillId = drillId, Source = "manual", Order = 0 }
            },
            AssignedCoachIds = new List<Guid> { coachId }
        };

        var result = await handler.Handle(new CreateTrainingSessionCommand(dto), CancellationToken.None);

        Assert.Single(result.Drills);
        Assert.Equal(drillId, result.Drills[0].DrillId);
        Assert.Single(result.Coaches);
        Assert.Equal(coachId, result.Coaches[0].CoachId);
    }

    [Fact]
    public async Task Handle_WithAttendance_MapsStatusCorrectly()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        var handler = new CreateTrainingSessionHandler(db.Context);
        var dto = ValidDto(teamId) with
        {
            Attendance = new List<CreateSessionAttendanceDto>
            {
                new() { PlayerId = playerId, Status = "confirmed", Notes = "" }
            }
        };

        var result = await handler.Handle(new CreateTrainingSessionCommand(dto), CancellationToken.None);

        Assert.Single(result.Attendance);
        Assert.Equal("confirmed", result.Attendance[0].Status);
    }
}
