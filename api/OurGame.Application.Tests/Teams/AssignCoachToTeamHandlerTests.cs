using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.AssignCoachToTeam;
using OurGame.Application.UseCases.Teams.Commands.AssignCoachToTeam.DTOs;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class AssignCoachToTeamHandlerTests
{
    [Fact]
    public async Task Handle_WhenRoleInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new AssignCoachToTeamHandler(db.Context);
        var dto = new AssignCoachToTeamRequestDto { CoachId = Guid.NewGuid(), Role = "invalid" };
        var command = new AssignCoachToTeamCommand(Guid.NewGuid(), dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Role"));
    }

    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new AssignCoachToTeamHandler(db.Context);
        var dto = new AssignCoachToTeamRequestDto { CoachId = Guid.NewGuid(), Role = "headcoach" };
        var command = new AssignCoachToTeamCommand(Guid.NewGuid(), dto);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenTeamArchived_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId, isArchived: true);
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var handler = new AssignCoachToTeamHandler(db.Context);
        var dto = new AssignCoachToTeamRequestDto { CoachId = coachId, Role = "headcoach" };
        var command = new AssignCoachToTeamCommand(teamId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Team"));
    }

    [Fact]
    public async Task Handle_WhenCoachNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new AssignCoachToTeamHandler(db.Context);
        var dto = new AssignCoachToTeamRequestDto { CoachId = Guid.NewGuid(), Role = "headcoach" };
        var command = new AssignCoachToTeamCommand(teamId, dto);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenCoachArchived_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId, isArchived: true);
        var handler = new AssignCoachToTeamHandler(db.Context);
        var dto = new AssignCoachToTeamRequestDto { CoachId = coachId, Role = "headcoach" };
        var command = new AssignCoachToTeamCommand(teamId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Coach"));
        Assert.Contains("archived", ex.Errors["Coach"][0], StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Handle_WhenCoachFromDifferentClub_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var otherClubId = await db.SeedClubAsync("Other Club");
        var (coachId, _) = await db.SeedCoachAsync(otherClubId, "other-coach-auth");
        var handler = new AssignCoachToTeamHandler(db.Context);
        var dto = new AssignCoachToTeamRequestDto { CoachId = coachId, Role = "headcoach" };
        var command = new AssignCoachToTeamCommand(teamId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Coach"));
        Assert.Contains("same club", ex.Errors["Coach"][0], StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Handle_WhenCoachAlreadyAssigned_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        await db.SeedTeamCoachAsync(teamId, coachId);
        var handler = new AssignCoachToTeamHandler(db.Context);
        var dto = new AssignCoachToTeamRequestDto { CoachId = coachId, Role = "assistantcoach" };
        var command = new AssignCoachToTeamCommand(teamId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Coach"));
        Assert.Contains("already assigned", ex.Errors["Coach"][0], StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Handle_WhenValid_ReturnsTeamCoachDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId, firstName: "Jane", lastName: "Smith");
        var handler = new AssignCoachToTeamHandler(db.Context);
        var dto = new AssignCoachToTeamRequestDto { CoachId = coachId, Role = "assistantcoach" };
        var command = new AssignCoachToTeamCommand(teamId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(coachId, result.Id);
        Assert.Equal("Jane", result.FirstName);
        Assert.Equal("Smith", result.LastName);
        Assert.Equal("AssistantCoach", result.Role);
        Assert.False(result.IsArchived);
    }
}
