using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById;

namespace OurGame.Application.Tests.DevelopmentPlans;

public class GetDevelopmentPlanByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetDevelopmentPlanByIdHandler(db.Context);

        var result = await handler.Handle(new GetDevelopmentPlanByIdQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenExists_ReturnsMappedDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);
        var planId = await db.SeedDevelopmentPlanAsync(playerId: playerId, title: "Growth Plan");

        var handler = new GetDevelopmentPlanByIdHandler(db.Context);
        var result = await handler.Handle(new GetDevelopmentPlanByIdQuery(planId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(planId, result.Id);
        Assert.Equal("Growth Plan", result.Title);
        Assert.Equal(playerId, result.PlayerId);
        Assert.Equal(clubId, result.ClubId);
        Assert.Equal("Active", result.Status);
    }

    [Fact]
    public async Task Handle_IncludesGoals()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);
        var planId = await db.SeedDevelopmentPlanAsync(playerId: playerId);

        db.Context.DevelopmentGoals.Add(new OurGame.Persistence.Models.DevelopmentGoal
        {
            Id = Guid.NewGuid(),
            PlanId = planId,
            Goal = "Improve passing",
            Actions = "[\"Practice short passes\",\"Work on long balls\"]",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1)),
            Progress = 40,
            Completed = false
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetDevelopmentPlanByIdHandler(db.Context);
        var result = await handler.Handle(new GetDevelopmentPlanByIdQuery(planId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.Goals);
        Assert.Equal("Improve passing", result.Goals[0].Title);
        Assert.Equal(40, result.Goals[0].Progress);
        Assert.Equal(2, result.Goals[0].Actions.Count);
        Assert.Equal("InProgress", result.Goals[0].Status);
    }

    [Fact]
    public async Task Handle_CompletedGoal_HasCompletedStatus()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);
        var planId = await db.SeedDevelopmentPlanAsync(playerId: playerId);

        db.Context.DevelopmentGoals.Add(new OurGame.Persistence.Models.DevelopmentGoal
        {
            Id = Guid.NewGuid(),
            PlanId = planId,
            Goal = "Complete goal",
            Actions = "[]",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-1)),
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow),
            CompletedDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Progress = 100,
            Completed = true
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetDevelopmentPlanByIdHandler(db.Context);
        var result = await handler.Handle(new GetDevelopmentPlanByIdQuery(planId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.Goals);
        Assert.Equal("Completed", result.Goals[0].Status);
    }

    [Fact]
    public async Task Handle_IncludesPlayerNameAndClubContext()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync(name: "Test Club");
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        var planId = await db.SeedDevelopmentPlanAsync(playerId: playerId);

        var handler = new GetDevelopmentPlanByIdHandler(db.Context);
        var result = await handler.Handle(new GetDevelopmentPlanByIdQuery(planId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Test Club", result.ClubName);
        Assert.False(string.IsNullOrEmpty(result.PlayerName));
    }
}
