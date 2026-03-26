using Microsoft.EntityFrameworkCore;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Queries.GetClubStatistics;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Clubs;

public class GetClubStatisticsHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoData_ReturnsZeroStats()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetClubStatisticsHandler(db.Context);

        var result = await handler.Handle(new GetClubStatisticsQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(0, result.PlayerCount);
        Assert.Equal(0, result.TeamCount);
        Assert.Equal(0, result.AgeGroupCount);
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
    public async Task Handle_CountsPlayersTeamsAndAgeGroups()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId);

        var handler = new GetClubStatisticsHandler(db.Context);
        var result = await handler.Handle(new GetClubStatisticsQuery(clubId), CancellationToken.None);

        Assert.Equal(1, result.PlayerCount);
        Assert.Equal(1, result.TeamCount);
        Assert.Equal(1, result.AgeGroupCount);
    }

    [Fact]
    public async Task Handle_CalculatesMatchStatistics()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        // Win: home 3-1
        var winMatchId = await db.SeedMatchAsync(teamId, "Win FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(-10));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 3, AwayScore = 1 WHERE Id = {winMatchId}");

        // Draw: home 2-2
        var drawMatchId = await db.SeedMatchAsync(teamId, "Draw FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(-5));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 2, AwayScore = 2 WHERE Id = {drawMatchId}");

        // Loss: home 0-1
        var lossMatchId = await db.SeedMatchAsync(teamId, "Loss FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(-3));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 0, AwayScore = 1 WHERE Id = {lossMatchId}");

        var handler = new GetClubStatisticsHandler(db.Context);
        var result = await handler.Handle(new GetClubStatisticsQuery(clubId), CancellationToken.None);

        Assert.Equal(3, result.MatchesPlayed);
        Assert.Equal(1, result.Wins);
        Assert.Equal(1, result.Draws);
        Assert.Equal(1, result.Losses);
        // GoalDifference: (3+2+0) for - (1+2+1) against = 5-4 = 1
        Assert.Equal(1, result.GoalDifference);
        Assert.True(result.WinRate > 0);
    }
}
