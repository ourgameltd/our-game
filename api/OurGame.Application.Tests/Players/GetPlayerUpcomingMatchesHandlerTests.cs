using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Queries.GetPlayerUpcomingMatches;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Players;

public class GetPlayerUpcomingMatchesHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoUpcomingMatches_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new GetPlayerUpcomingMatchesHandler(db.Context);

        var result = await handler.Handle(
            new GetPlayerUpcomingMatchesQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsUpcomingScheduledMatches()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId);
        var matchId = await db.SeedMatchAsync(teamId, "Future FC", MatchStatus.Scheduled, DateTime.UtcNow.AddDays(7));
        var handler = new GetPlayerUpcomingMatchesHandler(db.Context);

        var result = await handler.Handle(
            new GetPlayerUpcomingMatchesQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result!);
        Assert.Equal(matchId, result[0].MatchId);
        Assert.Equal(teamId, result[0].TeamId);
        Assert.Equal(ageGroupId, result[0].AgeGroupId);
        Assert.Equal("Future FC", result[0].Opponent);
        Assert.Equal("Blues", result[0].TeamName);
    }

    [Fact]
    public async Task Handle_ExcludesCompletedMatches()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId);

        // Completed match in the future should not appear
        await db.SeedMatchAsync(teamId, "Past FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(3));
        // Scheduled match in the future should appear
        var scheduledId = await db.SeedMatchAsync(teamId, "Future FC", MatchStatus.Scheduled, DateTime.UtcNow.AddDays(7));

        var handler = new GetPlayerUpcomingMatchesHandler(db.Context);

        var result = await handler.Handle(
            new GetPlayerUpcomingMatchesQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result!);
        Assert.Equal(scheduledId, result[0].MatchId);
        Assert.Equal("Future FC", result[0].Opponent);
    }
}
