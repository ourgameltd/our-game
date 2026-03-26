using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.UpdateDevelopmentPlan;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.UpdateDevelopmentPlan.DTOs;

namespace OurGame.Application.Tests.DevelopmentPlans;

public class UpdateDevelopmentPlanHandlerTests
{
    private static UpdateDevelopmentPlanRequest ValidDto() => new()
    {
        Title = "Updated Plan",
        Description = "Updated description",
        PeriodStart = new DateTime(2025, 1, 1),
        PeriodEnd = new DateTime(2025, 6, 30),
        Status = "active",
        CoachNotes = "Updated notes",
        Goals = new List<UpdateDevelopmentGoalRequest>()
    };

    [Fact]
    public async Task Handle_WhenTitleEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateDevelopmentPlanHandler(db.Context);

        var dto = ValidDto() with { Title = "" };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateDevelopmentPlanCommand(Guid.NewGuid(), dto), CancellationToken.None));
        Assert.Contains("Title", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenPeriodStartAfterEnd_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateDevelopmentPlanHandler(db.Context);

        var dto = ValidDto() with
        {
            PeriodStart = new DateTime(2025, 7, 1),
            PeriodEnd = new DateTime(2025, 1, 1)
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateDevelopmentPlanCommand(Guid.NewGuid(), dto), CancellationToken.None));
        Assert.Contains("PeriodStart", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenPlanNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateDevelopmentPlanHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateDevelopmentPlanCommand(Guid.NewGuid(), ValidDto()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenInvalidStatus_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);
        var planId = await db.SeedDevelopmentPlanAsync(playerId: playerId);

        var handler = new UpdateDevelopmentPlanHandler(db.Context);
        var dto = ValidDto() with { Status = "invalid" };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateDevelopmentPlanCommand(planId, dto), CancellationToken.None));
        Assert.Contains("Status", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesAndReturnsDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);
        var planId = await db.SeedDevelopmentPlanAsync(playerId: playerId);

        var handler = new UpdateDevelopmentPlanHandler(db.Context);
        var dto = ValidDto() with
        {
            Goals = new List<UpdateDevelopmentGoalRequest>
            {
                new()
                {
                    Goal = "New goal",
                    Actions = new List<string> { "Action 1" },
                    StartDate = new DateTime(2025, 1, 1),
                    TargetDate = new DateTime(2025, 3, 31),
                    Progress = 50,
                    Completed = false
                }
            }
        };

        var result = await handler.Handle(new UpdateDevelopmentPlanCommand(planId, dto), CancellationToken.None);

        Assert.Equal("Updated Plan", result.Title);
        Assert.Equal("Updated description", result.Description);
        Assert.Equal("active", result.Status);
        Assert.Equal("Updated notes", result.CoachNotes);
        Assert.Single(result.Goals);
        Assert.Equal("New goal", result.Goals[0].Goal);
        Assert.Equal(50, result.Goals[0].Progress);
    }

    [Fact]
    public async Task Handle_ReplacesGoals()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);
        var planId = await db.SeedDevelopmentPlanAsync(playerId: playerId);

        // Seed an existing goal
        db.Context.DevelopmentGoals.Add(new OurGame.Persistence.Models.DevelopmentGoal
        {
            Id = Guid.NewGuid(),
            PlanId = planId,
            Goal = "Old goal",
            Actions = "[]",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1)),
            Progress = 10,
            Completed = false
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateDevelopmentPlanHandler(db.Context);
        var dto = ValidDto() with
        {
            Goals = new List<UpdateDevelopmentGoalRequest>
            {
                new()
                {
                    Goal = "Replacement goal",
                    Actions = new List<string>(),
                    StartDate = new DateTime(2025, 2, 1),
                    TargetDate = new DateTime(2025, 5, 31),
                    Progress = 0,
                    Completed = false
                }
            }
        };

        var result = await handler.Handle(new UpdateDevelopmentPlanCommand(planId, dto), CancellationToken.None);

        Assert.Single(result.Goals);
        Assert.Equal("Replacement goal", result.Goals[0].Goal);
    }
}
