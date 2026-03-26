using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetDevelopmentPlansByTeamId;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Teams;

public class GetDevelopmentPlansByTeamIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsKeyNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetDevelopmentPlansByTeamIdHandler(db.Context);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            handler.Handle(new GetDevelopmentPlansByTeamIdQuery(Guid.NewGuid()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNoPlans_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();

        var handler = new GetDevelopmentPlansByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetDevelopmentPlansByTeamIdQuery(teamId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsPlansForTeam()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        db.Context.PlayerTeams.Add(new PlayerTeam
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            TeamId = teamId
        });
        await db.Context.SaveChangesAsync();

        var planId = await db.SeedDevelopmentPlanAsync(playerId: playerId, coachId: coachId, title: "Team Plan");

        var handler = new GetDevelopmentPlansByTeamIdHandler(db.Context);
        var result = await handler.Handle(new GetDevelopmentPlansByTeamIdQuery(teamId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(planId, result[0].Id);
        Assert.Equal("Team Plan", result[0].Title);
    }
}
