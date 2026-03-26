using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.CreateDevelopmentPlan;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.CreateDevelopmentPlan.DTOs;

namespace OurGame.Application.Tests.DevelopmentPlans;

public class CreateDevelopmentPlanHandlerTests
{
    [Fact]
    public async Task Handle_WhenTitleEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDevelopmentPlanHandler(db.Context);

        var dto = new CreateDevelopmentPlanRequest
        {
            Title = "",
            PlayerId = Guid.NewGuid(),
            PeriodStart = DateTime.UtcNow,
            PeriodEnd = DateTime.UtcNow.AddMonths(3),
            Status = "active"
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDevelopmentPlanCommand(dto), CancellationToken.None));
        Assert.Contains("Title", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenPeriodStartAfterEnd_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDevelopmentPlanHandler(db.Context);

        var dto = new CreateDevelopmentPlanRequest
        {
            Title = "My Plan",
            PlayerId = Guid.NewGuid(),
            PeriodStart = DateTime.UtcNow.AddMonths(3),
            PeriodEnd = DateTime.UtcNow,
            Status = "active"
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDevelopmentPlanCommand(dto), CancellationToken.None));
        Assert.Contains("PeriodStart", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenPlayerNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDevelopmentPlanHandler(db.Context);

        var dto = new CreateDevelopmentPlanRequest
        {
            Title = "My Plan",
            PlayerId = Guid.NewGuid(),
            PeriodStart = DateTime.UtcNow,
            PeriodEnd = DateTime.UtcNow.AddMonths(3),
            Status = "active"
        };

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new CreateDevelopmentPlanCommand(dto), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenInvalidStatus_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        var handler = new CreateDevelopmentPlanHandler(db.Context);
        var dto = new CreateDevelopmentPlanRequest
        {
            Title = "My Plan",
            PlayerId = playerId,
            PeriodStart = DateTime.UtcNow,
            PeriodEnd = DateTime.UtcNow.AddMonths(3),
            Status = "invalid"
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDevelopmentPlanCommand(dto), CancellationToken.None));
        Assert.Contains("Status", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesPlanAndReturnsDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        var handler = new CreateDevelopmentPlanHandler(db.Context);
        var dto = new CreateDevelopmentPlanRequest
        {
            Title = "Season Development Plan",
            Description = "Focus on finishing",
            PlayerId = playerId,
            PeriodStart = new DateTime(2025, 1, 1),
            PeriodEnd = new DateTime(2025, 6, 30),
            Status = "active",
            CoachNotes = "Work on weak foot",
            Goals = new List<CreateDevelopmentGoalRequest>
            {
                new()
                {
                    Goal = "Improve shooting accuracy",
                    Actions = new List<string> { "Extra shooting practice", "Video analysis" },
                    StartDate = new DateTime(2025, 1, 1),
                    TargetDate = new DateTime(2025, 3, 31),
                    Progress = 0,
                    Completed = false
                }
            }
        };

        var result = await handler.Handle(new CreateDevelopmentPlanCommand(dto), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Season Development Plan", result.Title);
        Assert.Equal("Focus on finishing", result.Description);
        Assert.Equal(playerId, result.PlayerId);
        Assert.Equal("active", result.Status);
        Assert.Equal("Work on weak foot", result.CoachNotes);
        Assert.Single(result.Goals);
        Assert.Equal("Improve shooting accuracy", result.Goals[0].Goal);
        Assert.Equal(2, result.Goals[0].Actions.Count);
    }

    [Fact]
    public async Task Handle_FiltersEmptyGoals()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        var handler = new CreateDevelopmentPlanHandler(db.Context);
        var dto = new CreateDevelopmentPlanRequest
        {
            Title = "My Plan",
            PlayerId = playerId,
            PeriodStart = new DateTime(2025, 1, 1),
            PeriodEnd = new DateTime(2025, 6, 30),
            Status = "active",
            Goals = new List<CreateDevelopmentGoalRequest>
            {
                new()
                {
                    Goal = "Valid goal",
                    Actions = new List<string>(),
                    StartDate = new DateTime(2025, 1, 1),
                    TargetDate = new DateTime(2025, 3, 31),
                    Progress = 0,
                    Completed = false
                },
                new()
                {
                    Goal = "", // should be filtered out
                    Actions = new List<string>(),
                    StartDate = new DateTime(2025, 1, 1),
                    TargetDate = new DateTime(2025, 3, 31),
                    Progress = 0,
                    Completed = false
                }
            }
        };

        var result = await handler.Handle(new CreateDevelopmentPlanCommand(dto), CancellationToken.None);

        Assert.Single(result.Goals); // empty goal filtered out
    }
}
