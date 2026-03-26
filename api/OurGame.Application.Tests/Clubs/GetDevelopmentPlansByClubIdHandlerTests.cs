using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Queries.GetDevelopmentPlansByClubId;

namespace OurGame.Application.Tests.Clubs;

public class GetDevelopmentPlansByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoPlans_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetDevelopmentPlansByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetDevelopmentPlansByClubIdQuery(clubId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsDevelopmentPlansForClub()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);
        var playerId = await db.SeedPlayerAsync(clubId: clubId);
        var planId = await db.SeedDevelopmentPlanAsync(playerId: playerId, coachId: coachId, title: "Improve Passing");

        var handler = new GetDevelopmentPlansByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetDevelopmentPlansByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(planId, result[0].Id);
        Assert.Equal("Improve Passing", result[0].Title);
        Assert.Equal(playerId, result[0].PlayerId);
    }
}
