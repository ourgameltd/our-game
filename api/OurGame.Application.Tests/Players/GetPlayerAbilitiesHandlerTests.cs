using Microsoft.EntityFrameworkCore;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Players;

public class GetPlayerAbilitiesHandlerTests
{
    [Fact]
    public async Task Handle_WhenPlayerNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetPlayerAbilitiesHandler(db.Context);
        var query = new GetPlayerAbilitiesQuery(Guid.NewGuid(), "user-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenFound_ReturnsPlayerBaseData()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, "Alex", "Vale");
        var handler = new GetPlayerAbilitiesHandler(db.Context);
        var query = new GetPlayerAbilitiesQuery(playerId, "user-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(playerId, result.Id);
        Assert.Equal("Alex", result.FirstName);
        Assert.Equal("Vale", result.LastName);
        Assert.Equal(clubId, result.ClubId);
    }

    [Fact]
    public async Task Handle_IncludesEvaluationHistory()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var evalId = await db.SeedAttributeEvaluationAsync(playerId, coachId);

        // Add evaluation attributes
        db.Context.EvaluationAttributes.AddRange(
            new EvaluationAttribute { Id = Guid.NewGuid(), EvaluationId = evalId, AttributeName = "BallControl", Rating = 75 },
            new EvaluationAttribute { Id = Guid.NewGuid(), EvaluationId = evalId, AttributeName = "Passing", Rating = 80 }
        );
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayerAbilitiesHandler(db.Context);
        var query = new GetPlayerAbilitiesQuery(playerId, "user-auth");

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.Evaluations);

        var eval = result.Evaluations[0];
        Assert.Equal(evalId, eval.Id);
        Assert.Equal(coachId, eval.EvaluatedBy);
        Assert.Equal(72, eval.OverallRating);
        Assert.Equal(2, eval.Attributes.Count);
        Assert.Contains(eval.Attributes, a => a.AttributeName == "BallControl" && a.Rating == 75);
        Assert.Contains(eval.Attributes, a => a.AttributeName == "Passing" && a.Rating == 80);
    }
}
