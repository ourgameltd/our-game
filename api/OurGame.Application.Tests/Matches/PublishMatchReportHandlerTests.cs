using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Commands.PublishMatchReport;
using OurGame.Application.UseCases.Matches.Commands.PublishMatchReport.DTOs;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Matches;

public class PublishMatchReportHandlerTests
{
    [Fact]
    public async Task Handle_WhenMatchNotFound_ThrowsNotFound()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new PublishMatchReportHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new PublishMatchReportCommand(Guid.NewGuid(), new PublishMatchReportRequestDto { IsPublished = true }), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNoReport_ThrowsNotFound()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(-1));
        var handler = new PublishMatchReportHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new PublishMatchReportCommand(matchId, new PublishMatchReportRequestDto { IsPublished = true }), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesPublishState()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var matchId = await db.SeedMatchAsync(teamId, "Rivals FC", MatchStatus.Completed, DateTime.UtcNow.AddDays(-1));
        var reportId = Guid.NewGuid();
        await db.Context.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO MatchReports (Id, MatchId, Summary, CaptainId, PlayerOfMatchId, IsPublished, CreatedAt) VALUES ({reportId}, {matchId}, 'Summary', NULL, NULL, {false}, GETUTCDATE())");
        var handler = new PublishMatchReportHandler(db.Context);

        await handler.Handle(new PublishMatchReportCommand(matchId, new PublishMatchReportRequestDto { IsPublished = true }), CancellationToken.None);

        var result = await new OurGame.Application.UseCases.Matches.Queries.GetMatchById.GetMatchByIdHandler(db.Context)
            .Handle(new OurGame.Application.UseCases.Matches.Queries.GetMatchById.GetMatchByIdQuery(matchId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result!.IsPublished);
    }
}
