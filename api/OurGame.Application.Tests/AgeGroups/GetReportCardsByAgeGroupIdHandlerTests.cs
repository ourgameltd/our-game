using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.AgeGroups.Queries.GetReportCardsByAgeGroupId;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.AgeGroups;

public class GetReportCardsByAgeGroupIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoReportCards_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);

        var handler = new GetReportCardsByAgeGroupIdHandler(db.Context);
        var result = await handler.Handle(new GetReportCardsByAgeGroupIdQuery(ageGroupId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsReportCardsForAgeGroup()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        db.Context.PlayerAgeGroups.Add(new PlayerAgeGroup
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            AgeGroupId = ageGroupId
        });

        db.Context.PlayerReports.Add(new PlayerReport
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            OverallRating = 8.0m,
            Strengths = "[\"pace\"]",
            AreasForImprovement = "[\"defending\"]",
            CoachComments = "Good work",
            CreatedBy = coachId,
            CreatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetReportCardsByAgeGroupIdHandler(db.Context);
        var result = await handler.Handle(new GetReportCardsByAgeGroupIdQuery(ageGroupId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(playerId, result[0].PlayerId);
        Assert.Equal(8.0m, result[0].OverallRating);
    }
}
