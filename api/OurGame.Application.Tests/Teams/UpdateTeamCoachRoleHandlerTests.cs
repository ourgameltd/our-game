using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole.DTOs;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class UpdateTeamCoachRoleHandlerTests
{
    [Fact]
    public async Task Handle_WhenAssignmentNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new UpdateTeamCoachRoleHandler(db.Context);
        var dto = new UpdateTeamCoachRoleRequestDto { IsPrimary = true };
        var command = new UpdateTeamCoachRoleCommand(teamId, Guid.NewGuid(), dto);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_SetsIsPrimaryTrue()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId, firstName: "Jane", lastName: "Coach");
        await db.SeedTeamCoachAsync(teamId, coachId, CoachRole.HeadCoach);
        var handler = new UpdateTeamCoachRoleHandler(db.Context);
        var dto = new UpdateTeamCoachRoleRequestDto { IsPrimary = true };
        var command = new UpdateTeamCoachRoleCommand(teamId, coachId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(coachId, result.Id);
        Assert.Equal("Jane", result.FirstName);
        Assert.True(result.IsPrimary);
        Assert.False(result.IsArchived);
    }

    [Fact]
    public async Task Handle_WhenValid_SetsIsPrimaryFalse()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        await db.SeedTeamCoachAsync(teamId, coachId, CoachRole.HeadCoach);
        var handler = new UpdateTeamCoachRoleHandler(db.Context);
        var dto = new UpdateTeamCoachRoleRequestDto { IsPrimary = false };
        var command = new UpdateTeamCoachRoleCommand(teamId, coachId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsPrimary);
    }
}
