using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Commands.CreatePlayerAbilityEvaluation;
using OurGame.Application.UseCases.Players.Commands.CreatePlayerAbilityEvaluation.DTOs;

namespace OurGame.Application.Tests.Players;

public class CreatePlayerAbilityEvaluationHandlerTests
{
    [Fact]
    public async Task Handle_WhenPlayerNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreatePlayerAbilityEvaluationHandler(db.Context);
        var command = new CreatePlayerAbilityEvaluationCommand(
            Guid.NewGuid(),
            "user-auth",
            new CreatePlayerAbilityEvaluationRequestDto
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
    public async Task Handle_WhenRatingOutOfRange_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var handler = new CreatePlayerAbilityEvaluationHandler(db.Context);
        var command = new CreatePlayerAbilityEvaluationCommand(
            playerId,
            "coach-auth",
            new CreatePlayerAbilityEvaluationRequestDto
            {
                EvaluatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                Attributes = new List<EvaluationAttributeRequestDto>
                {
                    new() { AttributeName = "BallControl", Rating = 75 },
                    new() { AttributeName = "Passing", Rating = 150 }
                }
            });

        await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesEvaluationWithAttributes()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId);
        var handler = new CreatePlayerAbilityEvaluationHandler(db.Context);

        var command = new CreatePlayerAbilityEvaluationCommand(
            playerId,
            "coach-auth",
            new CreatePlayerAbilityEvaluationRequestDto
            {
                EvaluatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                CoachNotes = "Good session",
                PeriodStart = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-1)),
                PeriodEnd = DateOnly.FromDateTime(DateTime.UtcNow),
                Attributes = new List<EvaluationAttributeRequestDto>
                {
                    new() { AttributeName = "BallControl", Rating = 75, Notes = "Solid" },
                    new() { AttributeName = "Passing", Rating = 80 },
                    new() { AttributeName = "Vision", Rating = 70 }
                }
            });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(coachId, result.EvaluatedBy);
        Assert.Equal("Good session", result.CoachNotes);
        Assert.Equal(75, result.OverallRating); // average of 75, 80, 70 = 75
        Assert.Equal(3, result.Attributes.Count);
        Assert.Contains(result.Attributes, a => a.AttributeName == "BallControl" && a.Rating == 75);
        Assert.Contains(result.Attributes, a => a.AttributeName == "Passing" && a.Rating == 80);
        Assert.Contains(result.Attributes, a => a.AttributeName == "Vision" && a.Rating == 70);
    }

    [Fact]
    public async Task Handle_FallsBackToFirstCoachWhenUserNotLinked()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var (coachId, _) = await db.SeedCoachAsync(clubId, "actual-coach-auth");
        var handler = new CreatePlayerAbilityEvaluationHandler(db.Context);

        var command = new CreatePlayerAbilityEvaluationCommand(
            playerId,
            "unlinked-user-auth",
            new CreatePlayerAbilityEvaluationRequestDto
            {
                EvaluatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                Attributes = new List<EvaluationAttributeRequestDto>
                {
                    new() { AttributeName = "BallControl", Rating = 60 },
                    new() { AttributeName = "Passing", Rating = 70 }
                }
            });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(coachId, result.EvaluatedBy);
        Assert.Equal(65, result.OverallRating); // average of 60, 70
        Assert.Equal(2, result.Attributes.Count);
    }
}
