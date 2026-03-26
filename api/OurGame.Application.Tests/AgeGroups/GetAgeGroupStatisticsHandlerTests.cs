using Microsoft.EntityFrameworkCore;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupStatistics;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.AgeGroups;

public class GetAgeGroupStatisticsHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoData_ReturnsZeroStats()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetAgeGroupStatisticsHandler(db.Context);

        var result = await handler.Handle(new GetAgeGroupStatisticsQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(0, result.PlayerCount);
        Assert.Equal(0, result.MatchesPlayed);
        Assert.Equal(0, result.Wins);
        Assert.Equal(0, result.Draws);
        Assert.Equal(0, result.Losses);
        Assert.Equal(0m, result.WinRate);
        Assert.Equal(0, result.GoalDifference);
        Assert.Empty(result.UpcomingMatches);
        Assert.Empty(result.PreviousResults);
    }

    [Fact]
    public async Task Handle_CountsPlayers()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId);

        var handler = new GetAgeGroupStatisticsHandler(db.Context);
        var result = await handler.Handle(new GetAgeGroupStatisticsQuery(ageGroupId), CancellationToken.None);

        Assert.Equal(1, result.PlayerCount);
    }

    [Fact]
    public async Task Handle_CalculatesMatchStatistics()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        // Win: home 2-0
        var winMatchId = await db.SeedMatchAsync(teamId, "Win FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(-7));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 2, AwayScore = 0 WHERE Id = {winMatchId}");

        // Loss: home 1-3
        var lossMatchId = await db.SeedMatchAsync(teamId, "Loss FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(-3));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 1, AwayScore = 3 WHERE Id = {lossMatchId}");

        var handler = new GetAgeGroupStatisticsHandler(db.Context);
        var result = await handler.Handle(new GetAgeGroupStatisticsQuery(ageGroupId), CancellationToken.None);

        Assert.Equal(2, result.MatchesPlayed);
        Assert.Equal(1, result.Wins);
        Assert.Equal(0, result.Draws);
        Assert.Equal(1, result.Losses);
        // GoalDifference: (2+1) for - (0+3) against = 3-3 = 0
        Assert.Equal(0, result.GoalDifference);
    }
}
