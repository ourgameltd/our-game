using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Commands.DeletePlayerAbilityEvaluation;
using OurGame.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace OurGame.Application.Tests.Players;

public class DeletePlayerAbilityEvaluationHandlerTests
{
    [Fact]
    public async Task Handle_WhenEvaluationNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new DeletePlayerAbilityEvaluationHandler(db.Context);
        var command = new DeletePlayerAbilityEvaluationCommand(playerId, Guid.NewGuid(), "user-auth");

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenEvaluationBelongsToDifferentPlayer_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var player1 = await db.SeedPlayerAsync(clubId, "Player", "One");
        var player2 = await db.SeedPlayerAsync(clubId, "Player", "Two");
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var evalId = await db.SeedAttributeEvaluationAsync(player1, coachId);
        var handler = new DeletePlayerAbilityEvaluationHandler(db.Context);
        var command = new DeletePlayerAbilityEvaluationCommand(player2, evalId, "user-auth");

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_DeletesEvaluationAndAttributes()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var evalId = await db.SeedAttributeEvaluationAsync(playerId, coachId);

        // Add some evaluation attributes
        db.Context.EvaluationAttributes.AddRange(
            new EvaluationAttribute { Id = Guid.NewGuid(), EvaluationId = evalId, AttributeName = "Pace", Rating = 80 },
            new EvaluationAttribute { Id = Guid.NewGuid(), EvaluationId = evalId, AttributeName = "Shooting", Rating = 75 }
        );
        await db.Context.SaveChangesAsync();

        var handler = new DeletePlayerAbilityEvaluationHandler(db.Context);
        var command = new DeletePlayerAbilityEvaluationCommand(playerId, evalId, "user-auth");

        await handler.Handle(command, CancellationToken.None);

        var evalsRemaining = await db.Context.AttributeEvaluations
            .AsNoTracking()
            .Where(e => e.Id == evalId)
            .CountAsync();
        Assert.Equal(0, evalsRemaining);

        var attrsRemaining = await db.Context.EvaluationAttributes
            .AsNoTracking()
            .Where(a => a.EvaluationId == evalId)
            .CountAsync();
        Assert.Equal(0, attrsRemaining);
    }
}
