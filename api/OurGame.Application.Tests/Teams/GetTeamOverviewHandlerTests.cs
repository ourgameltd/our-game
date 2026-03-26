using Microsoft.EntityFrameworkCore;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class GetTeamOverviewHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetTeamOverviewHandler(db.Context);

        var result = await handler.Handle(new GetTeamOverviewQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_ReturnsOverviewWithBasicData()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId);

        // Seed a completed match with scores
        var matchId = await db.SeedMatchAsync(teamId, "Rival FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(-5));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 2, AwayScore = 1 WHERE Id = {matchId}");

        var handler = new GetTeamOverviewHandler(db.Context);
        var result = await handler.Handle(new GetTeamOverviewQuery(teamId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(teamId, result.Team.Id);
        Assert.Equal(clubId, result.Team.ClubId);
        Assert.Equal(ageGroupId, result.Team.AgeGroupId);
        Assert.Equal("Blues", result.Team.Name);

        Assert.Equal(1, result.Statistics.PlayerCount);
        Assert.Equal(1, result.Statistics.MatchesPlayed);
        Assert.Equal(1, result.Statistics.Wins);
        Assert.Equal(0, result.Statistics.Draws);
        Assert.Equal(0, result.Statistics.Losses);
        Assert.Equal(1, result.Statistics.GoalDifference);
        Assert.Single(result.Statistics.PreviousResults);
    }
}
