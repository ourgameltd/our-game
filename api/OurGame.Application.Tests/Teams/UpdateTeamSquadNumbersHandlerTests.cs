using Microsoft.EntityFrameworkCore;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamSquadNumbers;

namespace OurGame.Application.Tests.Teams;

public class UpdateTeamSquadNumbersHandlerTests
{
    [Fact]
    public async Task Handle_WhenDuplicateSquadNumbers_ReturnsFailure()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var p1 = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "A", "One", 1);
        var p2 = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "B", "Two", 2);
        var handler = new UpdateTeamSquadNumbersHandler(db.Context);

        var assignments = new List<SquadNumberAssignment>
        {
            new(p1, 10),
            new(p2, 10) // duplicate
        };
        var command = new UpdateTeamSquadNumbersCommand(teamId, assignments, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains("Duplicate", result.ErrorMessage!);
    }

    [Fact]
    public async Task Handle_WhenPlayerNotOnTeam_ReturnsNotFound()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var unassignedPlayerId = await db.SeedPlayerAsync(clubId, "Unassigned", "Player");
        var handler = new UpdateTeamSquadNumbersHandler(db.Context);

        var assignments = new List<SquadNumberAssignment>
        {
            new(unassignedPlayerId, 10)
        };
        var command = new UpdateTeamSquadNumbersCommand(teamId, assignments, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsNotFound);
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesSquadNumbers()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var p1 = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "A", "One", 1);
        var p2 = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "B", "Two", 2);
        var handler = new UpdateTeamSquadNumbersHandler(db.Context);

        var assignments = new List<SquadNumberAssignment>
        {
            new(p1, 9),
            new(p2, 10)
        };
        var command = new UpdateTeamSquadNumbersCommand(teamId, assignments, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);

        // Verify numbers were updated (use AsNoTracking to bypass EF cache)
        var pt1 = await db.Context.PlayerTeams.AsNoTracking().FirstAsync(pt => pt.PlayerId == p1 && pt.TeamId == teamId);
        var pt2 = await db.Context.PlayerTeams.AsNoTracking().FirstAsync(pt => pt.PlayerId == p2 && pt.TeamId == teamId);
        Assert.Equal(9, pt1.SquadNumber);
        Assert.Equal(10, pt2.SquadNumber);
    }

    [Fact]
    public async Task Handle_SwappingNumbers_HandledAtomically()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var p1 = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "A", "One", 7);
        var p2 = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "B", "Two", 10);
        var handler = new UpdateTeamSquadNumbersHandler(db.Context);

        // Swap: p1 gets 10 and p2 gets 7 (would fail without two-phase approach)
        var assignments = new List<SquadNumberAssignment>
        {
            new(p1, 10),
            new(p2, 7)
        };
        var command = new UpdateTeamSquadNumbersCommand(teamId, assignments, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task Handle_NullSquadNumber_ClearsNumber()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var p1 = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "A", "One", 7);
        var handler = new UpdateTeamSquadNumbersHandler(db.Context);

        var assignments = new List<SquadNumberAssignment>
        {
            new(p1, null) // Clear
        };
        var command = new UpdateTeamSquadNumbersCommand(teamId, assignments, "user");

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);

        var pt = await db.Context.PlayerTeams.AsNoTracking().FirstAsync(pt => pt.PlayerId == p1 && pt.TeamId == teamId);
        Assert.Null(pt.SquadNumber);
    }
}
