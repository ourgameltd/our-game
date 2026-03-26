using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.AddPlayerToTeam;

namespace OurGame.Application.Tests.Teams;

public class AddPlayerToTeamHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ReturnsNotFound()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new AddPlayerToTeamHandler(db.Context);
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var command = new AddPlayerToTeamCommand(Guid.NewGuid(), playerId, 10, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.True(result.IsNotFound);
        Assert.Contains("Team", result.ErrorMessage!);
    }

    [Fact]
    public async Task Handle_WhenPlayerNotFound_ReturnsNotFound()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new AddPlayerToTeamHandler(db.Context);
        var command = new AddPlayerToTeamCommand(teamId, Guid.NewGuid(), 10, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.True(result.IsNotFound);
        Assert.Contains("Player", result.ErrorMessage!);
    }

    [Fact]
    public async Task Handle_WhenPlayerAlreadyAssigned_ReturnsFailure()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, squadNumber: 7);
        var handler = new AddPlayerToTeamHandler(db.Context);
        var command = new AddPlayerToTeamCommand(teamId, playerId, 10, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains("already assigned", result.ErrorMessage!);
    }

    [Fact]
    public async Task Handle_WhenSquadNumberTaken_ReturnsFailure()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Existing", "Player", 10);
        var newPlayerId = await db.SeedPlayerAsync(clubId, "New", "Player");
        var handler = new AddPlayerToTeamHandler(db.Context);
        var command = new AddPlayerToTeamCommand(teamId, newPlayerId, 10, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains("Squad number 10", result.ErrorMessage!);
    }

    [Fact]
    public async Task Handle_WhenValid_ReturnsSuccessWithDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId, "New", "Player");
        var handler = new AddPlayerToTeamHandler(db.Context);
        var command = new AddPlayerToTeamCommand(teamId, playerId, 9, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(playerId, result.Value!.PlayerId);
        Assert.Equal(teamId, result.Value.TeamId);
        Assert.Equal(9, result.Value.SquadNumber);
    }
}
