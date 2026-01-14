using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class DevelopmentGoalSeedData
{
    public static List<DevelopmentGoal> GetDevelopmentGoals()
    {
        var now = DateTime.UtcNow;
        
        return new List<DevelopmentGoal>
        {
            // Goals for Plan 1
            new DevelopmentGoal
            {
                Id = Guid.NewGuid(),
                PlanId = DevelopmentPlanSeedData.Plan1_Id,
                Goal = "Improve passing accuracy",
                Actions = "Focus on first touch and weight of pass in training",
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(2)),
                Completed = false,
                Progress = 60,
            },
            new DevelopmentGoal
            {
                Id = Guid.NewGuid(),
                PlanId = DevelopmentPlanSeedData.Plan1_Id,
                Goal = "Enhance dribbling skills",
                Actions = "Work on close control and change of direction",
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(2)),
                Completed = false,
                Progress = 40,
            },
            // Goals for Plan 2
            new DevelopmentGoal
            {
                Id = Guid.NewGuid(),
                PlanId = DevelopmentPlanSeedData.Plan2_Id,
                Goal = "Increase shot power",
                Actions = "Strengthen legs and improve technique",
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(3)),
                Completed = false,
                Progress = 50,
            },
            new DevelopmentGoal
            {
                Id = Guid.NewGuid(),
                PlanId = DevelopmentPlanSeedData.Plan2_Id,
                Goal = "Better positioning",
                Actions = "Improve understanding of striker movement",
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(3)),
                Completed = false,
                Progress = 70,
            },
            // Goals for Plan 3
            new DevelopmentGoal
            {
                Id = Guid.NewGuid(),
                PlanId = DevelopmentPlanSeedData.Plan3_Id,
                Goal = "Strengthen tackling",
                Actions = "Work on timing and body position",
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(2)),
                Completed = true, CompletedDate = DateOnly.FromDateTime(DateTime.UtcNow),
                Progress = 100,
            },
            new DevelopmentGoal
            {
                Id = Guid.NewGuid(),
                PlanId = DevelopmentPlanSeedData.Plan3_Id,
                Goal = "Improve aerial ability",
                Actions = "Jump technique and heading practice",
                TargetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(2)),
                Completed = false,
                Progress = 65,
            }
        };
    }
}
