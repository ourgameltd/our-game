using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById;
using OurGame.Persistence.Enums;
using Microsoft.EntityFrameworkCore;

namespace OurGame.Application.Tests.Matches;

public class GetMatchByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenMatchNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetMatchByIdHandler(db.Context);

        var result = await handler.Handle(
            new GetMatchByIdQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenFound_ReturnsMatchWithContext()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.Scheduled, DateTime.UtcNow.AddDays(7));
        var handler = new GetMatchByIdHandler(db.Context);

        var result = await handler.Handle(
            new GetMatchByIdQuery(matchId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(matchId, result!.Id);
        Assert.Equal(teamId, result.TeamId);
        Assert.Equal(ageGroupId, result.AgeGroupId);
        Assert.Equal(clubId, result.ClubId);
        Assert.Equal("Rivals FC", result.Opposition);
        Assert.Equal("scheduled", result.Status);
        Assert.Equal("Blues", result.TeamName);
        Assert.Equal("Vale FC", result.ClubName);
    }

    [Fact]
    public async Task Handle_IncludesMatchReport()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(-1));
        var playerId = await db.SeedPlayerAsync(clubId);

        var reportId = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO MatchReports (Id, MatchId, Summary, CaptainId, PlayerOfMatchId, CreatedAt) VALUES ({reportId}, {matchId}, 'Good game', NULL, NULL, GETUTCDATE())");

        var goalId = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO Goals (Id, MatchReportId, PlayerId, Minute, Period, AddedTimeMinutes, IsExtraTime, IsPenalty) VALUES ({goalId}, {reportId}, {playerId}, 45, 'first-half', NULL, 0, 0)");

        var handler = new GetMatchByIdHandler(db.Context);

        var result = await handler.Handle(
            new GetMatchByIdQuery(matchId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(result!.Report);
        Assert.Equal("Good game", result.Report!.Summary);
        Assert.Single(result.Report.Goals);
        Assert.Equal(playerId, result.Report.Goals[0].PlayerId);
        Assert.Equal(45, result.Report.Goals[0].Minute);
        Assert.Equal("first-half", result.Report.Goals[0].Period);
        Assert.Equal("completed", result.Status);
    }
}
