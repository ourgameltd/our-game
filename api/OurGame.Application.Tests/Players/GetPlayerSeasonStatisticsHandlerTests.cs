using Microsoft.EntityFrameworkCore;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Queries.GetPlayerSeasonStatistics;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Players;

public class GetPlayerSeasonStatisticsHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoData_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new GetPlayerSeasonStatisticsHandler(db.Context);

        var result = await handler.Handle(new GetPlayerSeasonStatisticsQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsSeasonWithAppearances()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId);

        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(-7));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 2, AwayScore = 0, SeasonId = '2024/25' WHERE Id = {matchId}");
        await db.SeedMatchLineupAsync(matchId, playerId);

        var handler = new GetPlayerSeasonStatisticsHandler(db.Context);

        var result = await handler.Handle(new GetPlayerSeasonStatisticsQuery(playerId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("2024/25", result[0].Season);
        Assert.Equal(1, result[0].Appearances);
        Assert.Equal(0, result[0].Goals);
        Assert.Equal(0, result[0].Assists);
    }

    [Fact]
    public async Task Handle_AggregatesGoalsAndAssistsPerSeason()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId);

        var match1 = await db.SeedMatchAsync(teamId, "Team A", MatchStatus.Completed, DateTime.UtcNow.AddDays(-14));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 3, AwayScore = 1, SeasonId = '2024/25' WHERE Id = {match1}");
        await db.SeedMatchLineupAsync(match1, playerId);

        var report1 = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO MatchReports (Id, MatchId, Summary, CaptainId, PlayerOfMatchId, IsPublished, CreatedAt) VALUES ({report1}, {match1}, N'Good', NULL, NULL, {false}, GETUTCDATE())");
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO Goals (Id, MatchReportId, PlayerId, IsPenalty, IsExtraTime) VALUES ({Guid.NewGuid()}, {report1}, {playerId}, 0, 0)");
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO Goals (Id, MatchReportId, PlayerId, IsPenalty, IsExtraTime) VALUES ({Guid.NewGuid()}, {report1}, {playerId}, 0, 0)");

        var scorerId = await db.SeedPlayerAsync(clubId, "Goal", "Scorer");
        var match2 = await db.SeedMatchAsync(teamId, "Team B", MatchStatus.Completed, DateTime.UtcNow.AddDays(-7));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET HomeScore = 1, AwayScore = 0, SeasonId = '2024/25' WHERE Id = {match2}");
        await db.SeedMatchLineupAsync(match2, playerId);
        var report2 = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO MatchReports (Id, MatchId, Summary, CaptainId, PlayerOfMatchId, IsPublished, CreatedAt) VALUES ({report2}, {match2}, N'Win', NULL, NULL, {false}, GETUTCDATE())");
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO Goals (Id, MatchReportId, PlayerId, AssistPlayerId, IsPenalty, IsExtraTime) VALUES ({Guid.NewGuid()}, {report2}, {scorerId}, {playerId}, 0, 0)");

        var handler = new GetPlayerSeasonStatisticsHandler(db.Context);

        var result = await handler.Handle(new GetPlayerSeasonStatisticsQuery(playerId), CancellationToken.None);

        Assert.Single(result);
        var season = result[0];
        Assert.Equal("2024/25", season.Season);
        Assert.Equal(2, season.Appearances);
        Assert.Equal(2, season.Goals);
        Assert.Equal(1, season.Assists);
    }

    [Fact]
    public async Task Handle_IncludesMatchAttendanceStats()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, _, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId);

        var matchId = await db.SeedMatchAsync(teamId, "Away Team", MatchStatus.Completed, DateTime.UtcNow.AddDays(-7));
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE Matches SET SeasonId = '2024/25' WHERE Id = {matchId}");
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO MatchAttendances (Id, MatchId, PlayerId, Status, Notes, CreatedAt, UpdatedAt) VALUES ({Guid.NewGuid()}, {matchId}, {playerId}, N'confirmed', NULL, GETUTCDATE(), GETUTCDATE())");

        var handler = new GetPlayerSeasonStatisticsHandler(db.Context);

        var result = await handler.Handle(new GetPlayerSeasonStatisticsQuery(playerId), CancellationToken.None);

        var season = result.First(s => s.Season == "2024/25");
        Assert.Equal(1, season.MatchesConfirmed);
        Assert.Equal(0, season.MatchesDeclined);
        Assert.Equal(1, season.MatchesRsvpd);
    }
}
