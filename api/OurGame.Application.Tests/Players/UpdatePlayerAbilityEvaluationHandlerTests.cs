using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerAbilityEvaluation;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerAbilityEvaluation.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Players;

public class UpdatePlayerAbilityEvaluationHandlerTests
{
    [Fact]
    public async Task Handle_WhenEvaluationNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var handler = new UpdatePlayerAbilityEvaluationHandler(db.Context);
        var command = new UpdatePlayerAbilityEvaluationCommand(
            playerId,
            Guid.NewGuid(),
            "user-auth",
            new UpdatePlayerAbilityEvaluationRequestDto
            {
                EvaluatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                Attributes = new List<EvaluationAttributeRequestDto>
                {
                    new() { AttributeName = "BallControl", Rating = 75 }
                }
            });

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

        var handler = new UpdatePlayerAbilityEvaluationHandler(db.Context);
        var command = new UpdatePlayerAbilityEvaluationCommand(
            player2,
            evalId,
            "coach-auth",
            new UpdatePlayerAbilityEvaluationRequestDto
            {
                EvaluatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                Attributes = new List<EvaluationAttributeRequestDto>
                {
                    new() { AttributeName = "BallControl", Rating = 75 }
                }
            });

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesAndReturnsDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var evalId = await db.SeedAttributeEvaluationAsync(playerId, coachId);

        // Seed existing attributes on the evaluation
        db.Context.EvaluationAttributes.AddRange(
            new EvaluationAttribute { Id = Guid.NewGuid(), EvaluationId = evalId, AttributeName = "BallControl", Rating = 60, Notes = "Needs work" },
            new EvaluationAttribute { Id = Guid.NewGuid(), EvaluationId = evalId, AttributeName = "Passing", Rating = 55 }
        );
        await db.Context.SaveChangesAsync();

        var handler = new UpdatePlayerAbilityEvaluationHandler(db.Context);
        var command = new UpdatePlayerAbilityEvaluationCommand(
            playerId,
            evalId,
            "coach-auth",
            new UpdatePlayerAbilityEvaluationRequestDto
            {
                EvaluatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                CoachNotes = "Great improvement",
                PeriodStart = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-1)),
                PeriodEnd = DateOnly.FromDateTime(DateTime.UtcNow),
                Attributes = new List<EvaluationAttributeRequestDto>
                {
                    new() { AttributeName = "BallControl", Rating = 80, Notes = "Much improved" },
                    new() { AttributeName = "Passing", Rating = 85 },
                    new() { AttributeName = "Vision", Rating = 78 }
                }
            });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(evalId, result.Id);
        Assert.Equal(coachId, result.EvaluatedBy);
        Assert.Equal("Great improvement", result.CoachNotes);
        Assert.Equal(81, result.OverallRating); // average of 80, 85, 78 = 81
        Assert.Equal(3, result.Attributes.Count);
        Assert.Contains(result.Attributes, a => a.AttributeName == "BallControl" && a.Rating == 80);
        Assert.Contains(result.Attributes, a => a.AttributeName == "Passing" && a.Rating == 85);
        Assert.Contains(result.Attributes, a => a.AttributeName == "Vision" && a.Rating == 78);
    }
}
