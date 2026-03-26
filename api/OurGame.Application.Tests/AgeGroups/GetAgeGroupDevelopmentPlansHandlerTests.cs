using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupDevelopmentPlans;

namespace OurGame.Application.Tests.AgeGroups;

public class GetAgeGroupDevelopmentPlansHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoPlans_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);

        var handler = new GetAgeGroupDevelopmentPlansHandler(db.Context);
        var result = await handler.Handle(new GetAgeGroupDevelopmentPlansQuery(ageGroupId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsDevelopmentPlansForAgeGroup()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        db.Context.PlayerAgeGroups.Add(new OurGame.Persistence.Models.PlayerAgeGroup
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            AgeGroupId = ageGroupId
        });
        await db.Context.SaveChangesAsync();

        var planId = await db.SeedDevelopmentPlanAsync(playerId: playerId, coachId: coachId, title: "Speed Training");

        var handler = new GetAgeGroupDevelopmentPlansHandler(db.Context);
        var result = await handler.Handle(new GetAgeGroupDevelopmentPlansQuery(ageGroupId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(planId, result[0].Id);
        Assert.Equal("Speed Training", result[0].Title);
    }
}
