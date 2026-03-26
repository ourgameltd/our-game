using Microsoft.EntityFrameworkCore;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamPlayerSquadNumber;

namespace OurGame.Application.Tests.Teams;

public class UpdateTeamPlayerSquadNumberHandlerTests
{
    [Fact]
    public async Task Handle_WhenAssignmentNotFound_ReturnsNotFound()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new UpdateTeamPlayerSquadNumberHandler(db.Context);
        var command = new UpdateTeamPlayerSquadNumberCommand(teamId, Guid.NewGuid(), 10, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsNotFound);
    }

    [Fact]
    public async Task Handle_WhenSquadNumberTaken_ReturnsFailure()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Existing", "Player", 10);
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Target", "Player", 7);
        var handler = new UpdateTeamPlayerSquadNumberHandler(db.Context);
        var command = new UpdateTeamPlayerSquadNumberCommand(teamId, playerId, 10, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains("Squad number 10", result.ErrorMessage!);
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesSquadNumber()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Target", "Player", 7);
        var handler = new UpdateTeamPlayerSquadNumberHandler(db.Context);
        var command = new UpdateTeamPlayerSquadNumberCommand(teamId, playerId, 99, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);

        var pt = await db.Context.PlayerTeams.AsNoTracking().FirstAsync(pt => pt.PlayerId == playerId && pt.TeamId == teamId);
        Assert.Equal(99, pt.SquadNumber);
    }

    [Fact]
    public async Task Handle_WhenSameNumber_Succeeds()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Target", "Player", 7);
        var handler = new UpdateTeamPlayerSquadNumberHandler(db.Context);
        // Assigning the same number the player already has should succeed
        var command = new UpdateTeamPlayerSquadNumberCommand(teamId, playerId, 7, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
    }
}
