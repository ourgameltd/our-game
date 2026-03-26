using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.RemovePlayerFromTeam;

namespace OurGame.Application.Tests.Teams;

public class RemovePlayerFromTeamHandlerTests
{
    [Fact]
    public async Task Handle_WhenAssignmentNotFound_ReturnsNotFound()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new RemovePlayerFromTeamHandler(db.Context);
        var command = new RemovePlayerFromTeamCommand(teamId, Guid.NewGuid(), "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsNotFound);
    }

    [Fact]
    public async Task Handle_WhenValid_RemovesAndReturnsSuccess()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, squadNumber: 7);
        var handler = new RemovePlayerFromTeamHandler(db.Context);
        var command = new RemovePlayerFromTeamCommand(teamId, playerId, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);

        // Verify removal
        var count = db.Context.PlayerTeams.Count(pt => pt.TeamId == teamId && pt.PlayerId == playerId);
        Assert.Equal(0, count);
    }
}
