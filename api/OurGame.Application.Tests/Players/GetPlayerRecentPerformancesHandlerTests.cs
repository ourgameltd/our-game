using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Queries.GetPlayerRecentPerformances;
using OurGame.Persistence.Enums;
using Microsoft.EntityFrameworkCore;

namespace OurGame.Application.Tests.Players;

public class GetPlayerRecentPerformancesHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoAppearances_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new GetPlayerRecentPerformancesHandler(db.Context);

        var result = await handler.Handle(
            new GetPlayerRecentPerformancesQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsAppearancesFromLineup()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var matchId = await db.SeedMatchAsync(teamId, "Opponents", MatchStatus.Completed, DateTime.UtcNow.AddDays(-1));

        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 2, AwayScore = 1 WHERE Id = {matchId}");

        // Add player to lineup
        await db.SeedMatchLineupAsync(matchId, playerId);

        // Optionally add a rating
        var reportId = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO MatchReports (Id, MatchId, Summary, CaptainId, PlayerOfMatchId, IsPublished, CreatedAt) VALUES ({reportId}, {matchId}, 'Good game', NULL, NULL, {false}, GETUTCDATE())");
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO PerformanceRatings (Id, MatchReportId, PlayerId, Rating) VALUES ({Guid.NewGuid()}, {reportId}, {playerId}, 7.5)");

        var handler = new GetPlayerRecentPerformancesHandler(db.Context);

        var result = await handler.Handle(
            new GetPlayerRecentPerformancesQuery(playerId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Opponents", result[0].Opponent);
        Assert.Equal("W 2-1", result[0].Result);
        Assert.Equal(7.5m, result[0].Rating);
        Assert.Equal(teamId, result[0].TeamId);
        Assert.Equal(ageGroupId, result[0].AgeGroupId);
        Assert.False(string.IsNullOrEmpty(result[0].Season));
    }

    [Fact]
    public async Task Handle_ReturnsAppearanceWithNoRating_WhenPlayerInLineupOnly()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var matchId = await db.SeedMatchAsync(teamId, "Rivals", MatchStatus.Completed, DateTime.UtcNow.AddDays(-2));

        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 1, AwayScore = 0 WHERE Id = {matchId}");

        await db.SeedMatchLineupAsync(matchId, playerId);

        var handler = new GetPlayerRecentPerformancesHandler(db.Context);

        var result = await handler.Handle(
            new GetPlayerRecentPerformancesQuery(playerId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Rivals", result[0].Opponent);
        Assert.Null(result[0].Rating);
    }

    [Fact]
    public async Task Handle_CalculatesResultCorrectly()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId);

        var matchWin = await db.SeedMatchAsync(teamId, "Team A", MatchStatus.Completed, DateTime.UtcNow.AddDays(-3));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 3, AwayScore = 1, IsHome = 1 WHERE Id = {matchWin}");
        await db.SeedMatchLineupAsync(matchWin, playerId);
        var reportWin = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO MatchReports (Id, MatchId, Summary, CaptainId, PlayerOfMatchId, IsPublished, CreatedAt) VALUES ({reportWin}, {matchWin}, 'Win', NULL, NULL, {false}, GETUTCDATE())");
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO PerformanceRatings (Id, MatchReportId, PlayerId, Rating) VALUES ({Guid.NewGuid()}, {reportWin}, {playerId}, 8.0)");

        var matchLoss = await db.SeedMatchAsync(teamId, "Team B", MatchStatus.Completed, DateTime.UtcNow.AddDays(-2));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 3, AwayScore = 1, IsHome = 0 WHERE Id = {matchLoss}");
        await db.SeedMatchLineupAsync(matchLoss, playerId);
        var reportLoss = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO MatchReports (Id, MatchId, Summary, CaptainId, PlayerOfMatchId, IsPublished, CreatedAt) VALUES ({reportLoss}, {matchLoss}, 'Loss', NULL, NULL, {false}, GETUTCDATE())");
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO PerformanceRatings (Id, MatchReportId, PlayerId, Rating) VALUES ({Guid.NewGuid()}, {reportLoss}, {playerId}, 5.0)");

        var matchDraw = await db.SeedMatchAsync(teamId, "Team C", MatchStatus.Completed, DateTime.UtcNow.AddDays(-1));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 2, AwayScore = 2, IsHome = 1 WHERE Id = {matchDraw}");
        await db.SeedMatchLineupAsync(matchDraw, playerId);
        var reportDraw = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO MatchReports (Id, MatchId, Summary, CaptainId, PlayerOfMatchId, IsPublished, CreatedAt) VALUES ({reportDraw}, {matchDraw}, 'Draw', NULL, NULL, {false}, GETUTCDATE())");
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO PerformanceRatings (Id, MatchReportId, PlayerId, Rating) VALUES ({Guid.NewGuid()}, {reportDraw}, {playerId}, 6.5)");

        var handler = new GetPlayerRecentPerformancesHandler(db.Context);

        var result = await handler.Handle(
            new GetPlayerRecentPerformancesQuery(playerId), CancellationToken.None);

        Assert.Equal(3, result.Count);

        var draw = result.First(r => r.Opponent == "Team C");
        var loss = result.First(r => r.Opponent == "Team B");
        var win = result.First(r => r.Opponent == "Team A");

        Assert.Equal("W 3-1", win.Result);
        Assert.Equal("L 1-3", loss.Result);
        Assert.Equal("D 2-2", draw.Result);
    }
}
