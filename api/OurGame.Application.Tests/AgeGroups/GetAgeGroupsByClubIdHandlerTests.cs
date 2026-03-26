using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupsByClubId;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.AgeGroups;

public class GetAgeGroupsByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoAgeGroups_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new GetAgeGroupsByClubIdHandler(db.Context);

        var result = await handler.Handle(new GetAgeGroupsByClubIdQuery(clubId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsMappedAgeGroupsWithStatistics()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId, name: "Under 14s");
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId, "Blues");
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Alex", "Vale");
        var handler = new GetAgeGroupsByClubIdHandler(db.Context);

        var result = await handler.Handle(new GetAgeGroupsByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result);
        var ag = result[0];
        Assert.Equal(ageGroupId, ag.Id);
        Assert.Equal("Under 14s", ag.Name);
        Assert.Equal(1, ag.TeamCount);
        Assert.Equal(1, ag.PlayerCount);
        Assert.Equal("youth", ag.Level);
    }

    [Fact]
    public async Task Handle_ExcludesArchivedByDefault()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await db.SeedAgeGroupAsync(clubId, name: "Active", isArchived: false);
        await db.SeedAgeGroupAsync(clubId, name: "Archived", code: "archive", isArchived: true);
        var handler = new GetAgeGroupsByClubIdHandler(db.Context);

        var result = await handler.Handle(new GetAgeGroupsByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Active", result[0].Name);
    }

    [Fact]
    public async Task Handle_IncludesArchivedWhenRequested()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await db.SeedAgeGroupAsync(clubId, name: "Active", isArchived: false);
        await db.SeedAgeGroupAsync(clubId, name: "Archived", code: "archive", isArchived: true);
        var handler = new GetAgeGroupsByClubIdHandler(db.Context);

        var result = await handler.Handle(new GetAgeGroupsByClubIdQuery(clubId, IncludeArchived: true), CancellationToken.None);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task Handle_CalculatesMatchStatistics()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId);

        // Add a completed match (home win)
        var matchId = await db.SeedMatchAsync(teamId, status: MatchStatus.Completed);
        var match = await db.Context.Matches.FindAsync(matchId);
        match!.HomeScore = 3;
        match.AwayScore = 1;
        match.IsHome = true;
        await db.Context.SaveChangesAsync();

        var handler = new GetAgeGroupsByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetAgeGroupsByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(1, result[0].MatchesPlayed);
        Assert.Equal(1, result[0].Wins);
        Assert.Equal(0, result[0].Draws);
        Assert.Equal(0, result[0].Losses);
        Assert.Equal(2, result[0].GoalDifference);
    }
}
