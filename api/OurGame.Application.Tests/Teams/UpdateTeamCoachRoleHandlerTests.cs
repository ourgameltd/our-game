using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole.DTOs;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class UpdateTeamCoachRoleHandlerTests
{
    [Fact]
    public async Task Handle_WhenRoleInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateTeamCoachRoleHandler(db.Context);
        var dto = new UpdateTeamCoachRoleRequestDto { Role = "invalid" };
        var command = new UpdateTeamCoachRoleCommand(Guid.NewGuid(), Guid.NewGuid(), dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Role"));
    }

    [Fact]
    public async Task Handle_WhenAssignmentNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new UpdateTeamCoachRoleHandler(db.Context);
        var dto = new UpdateTeamCoachRoleRequestDto { Role = "headcoach" };
        var command = new UpdateTeamCoachRoleCommand(teamId, Guid.NewGuid(), dto);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_ReturnsUpdatedCoachDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId, firstName: "Jane", lastName: "Coach");
        await db.SeedTeamCoachAsync(teamId, coachId, CoachRole.AssistantCoach);
        var handler = new UpdateTeamCoachRoleHandler(db.Context);
        var dto = new UpdateTeamCoachRoleRequestDto { Role = "goalkeepercoach" };
        var command = new UpdateTeamCoachRoleCommand(teamId, coachId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(coachId, result.Id);
        Assert.Equal("Jane", result.FirstName);
        Assert.Equal("Coach", result.LastName);
        Assert.Equal("GoalkeeperCoach", result.Role);
        Assert.False(result.IsArchived);
    }

    [Theory]
    [InlineData("headcoach", "HeadCoach")]
    [InlineData("assistantcoach", "AssistantCoach")]
    [InlineData("goalkeepercoach", "GoalkeeperCoach")]
    [InlineData("fitnesscoach", "FitnessCoach")]
    [InlineData("technicalcoach", "TechnicalCoach")]
    public async Task Handle_AcceptsAllValidRoles(string input, string expected)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        await db.SeedTeamCoachAsync(teamId, coachId);
        var handler = new UpdateTeamCoachRoleHandler(db.Context);
        var dto = new UpdateTeamCoachRoleRequestDto { Role = input };
        var command = new UpdateTeamCoachRoleCommand(teamId, coachId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(expected, result.Role);
    }
}
