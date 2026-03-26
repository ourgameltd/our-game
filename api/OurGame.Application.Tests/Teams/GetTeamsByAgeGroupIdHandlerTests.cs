using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByAgeGroupId;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class GetTeamsByAgeGroupIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoTeams_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new GetTeamsByAgeGroupIdHandler(db.Context);
        var query = new GetTeamsByAgeGroupIdQuery(ageGroupId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsMappedDtosWithStats()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "A", "One");
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        await db.SeedTeamCoachAsync(teamId, coachId);
        var handler = new GetTeamsByAgeGroupIdHandler(db.Context);
        var query = new GetTeamsByAgeGroupIdQuery(ageGroupId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        var team = result[0];
        Assert.Equal(teamId, team.Id);
        Assert.Equal("Blues", team.Name);
        Assert.Equal(1, team.Stats.PlayerCount);
        Assert.Equal(1, team.Stats.CoachCount);
        Assert.Equal(0, team.Stats.MatchesPlayed);
    }

    [Fact]
    public async Task Handle_ExcludesArchivedTeams()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        await db.SeedTeamAsync(clubId, ageGroupId, "Active");
        await db.SeedTeamAsync(clubId, ageGroupId, "Archived", isArchived: true);
        var handler = new GetTeamsByAgeGroupIdHandler(db.Context);
        var query = new GetTeamsByAgeGroupIdQuery(ageGroupId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Active", result[0].Name);
    }

    [Fact]
    public async Task Handle_ComputesMatchStatistics()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        // Seed a completed match result (win: home 3-1)
        var matchId = await db.SeedMatchAsync(teamId, "Rival", MatchStatus.Completed);
        var match = await db.Context.Matches.FindAsync(matchId);
        match!.HomeScore = 3;
        match.AwayScore = 1;
        match.IsHome = true;
        await db.Context.SaveChangesAsync();

        var handler = new GetTeamsByAgeGroupIdHandler(db.Context);
        var query = new GetTeamsByAgeGroupIdQuery(ageGroupId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(1, result[0].Stats.MatchesPlayed);
        Assert.Equal(1, result[0].Stats.Wins);
        Assert.Equal(0, result[0].Stats.Draws);
        Assert.Equal(0, result[0].Stats.Losses);
        Assert.Equal(2, result[0].Stats.GoalDifference); // 3-1
    }
}
