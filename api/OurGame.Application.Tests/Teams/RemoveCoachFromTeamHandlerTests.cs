using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.RemoveCoachFromTeam;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class RemoveCoachFromTeamHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new RemoveCoachFromTeamHandler(db.Context);
        var command = new RemoveCoachFromTeamCommand(Guid.NewGuid(), Guid.NewGuid());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenAssignmentNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new RemoveCoachFromTeamHandler(db.Context);
        var command = new RemoveCoachFromTeamCommand(teamId, Guid.NewGuid());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_RemovesAssignment()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        await db.SeedTeamCoachAsync(teamId, coachId);
        var handler = new RemoveCoachFromTeamHandler(db.Context);
        var command = new RemoveCoachFromTeamCommand(teamId, coachId);

        await handler.Handle(command, CancellationToken.None);

        var count = db.Context.TeamCoaches.Count(tc => tc.TeamId == teamId && tc.CoachId == coachId);
        Assert.Equal(0, count);
    }
}
