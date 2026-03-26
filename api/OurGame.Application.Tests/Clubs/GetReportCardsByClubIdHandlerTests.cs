using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Queries.GetReportCardsByClubId;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Clubs;

public class GetReportCardsByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoReportCards_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetReportCardsByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetReportCardsByClubIdQuery(clubId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsReportCardsForClub()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        var reportId = Guid.NewGuid();
        db.Context.PlayerReports.Add(new PlayerReport
        {
            Id = reportId,
            PlayerId = playerId,
            OverallRating = 7.5m,
            Strengths = "[\"passing\",\"vision\"]",
            AreasForImprovement = "[\"shooting\"]",
            CoachComments = "Good progress",
            CreatedBy = coachId,
            CreatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetReportCardsByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetReportCardsByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(reportId, result[0].Id);
        Assert.Equal(playerId, result[0].PlayerId);
        Assert.Equal(7.5m, result[0].OverallRating);
    }
}
