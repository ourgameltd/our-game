using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class TrainingObjectiveSeedData
{
    public static List<TrainingObjective> GetTrainingObjectives()
    {
        return new List<TrainingObjective>
        {
            // Objectives for Carlos Silva's training plan
            new TrainingObjective
            {
                Id = Guid.NewGuid(),
                PlanId = TrainingPlanSeedData.Plan1_CarlosSilva_Id,
                Title = "Improve Aerial Ability",
                Description = "Increase heading accuracy and success rate in aerial duels. Target: 60% aerial duel success rate in matches.",
                StartDate = new DateOnly(2024, 12, 1),
                TargetDate = new DateOnly(2025, 2, 28),
                Status = "in-progress",
                Progress = 25,
                Completed = false
            },
            new TrainingObjective
            {
                Id = Guid.NewGuid(),
                PlanId = TrainingPlanSeedData.Plan1_CarlosSilva_Id,
                Title = "Enhance Defensive Work Rate",
                Description = "Increase pressing actions and defensive contributions. Target: 10+ pressing actions per game.",
                StartDate = new DateOnly(2024, 12, 1),
                TargetDate = new DateOnly(2025, 2, 28),
                Status = "in-progress",
                Progress = 40,
                Completed = false
            },
            new TrainingObjective
            {
                Id = Guid.NewGuid(),
                PlanId = TrainingPlanSeedData.Plan1_CarlosSilva_Id,
                Title = "Physical Conditioning",
                Description = "Complete strength and stamina program to maintain performance in final 15 minutes of games.",
                StartDate = new DateOnly(2024, 12, 1),
                TargetDate = new DateOnly(2025, 2, 28),
                Status = "in-progress",
                Progress = 50,
                Completed = false
            },
            // Objectives for Noah Anderson's training plan
            new TrainingObjective
            {
                Id = Guid.NewGuid(),
                PlanId = TrainingPlanSeedData.Plan2_MasonEvans_Id,
                Title = "Increase Goal Contributions",
                Description = "Improve finishing and assist numbers. Target: 1 goal contribution per 2 games.",
                StartDate = new DateOnly(2024, 12, 1),
                TargetDate = new DateOnly(2025, 2, 28),
                Status = "in-progress",
                Progress = 35,
                Completed = false
            },
            new TrainingObjective
            {
                Id = Guid.NewGuid(),
                PlanId = TrainingPlanSeedData.Plan2_MasonEvans_Id,
                Title = "Improve Weak Foot",
                Description = "Develop confidence and accuracy with left foot. Practice shooting and passing drills.",
                StartDate = new DateOnly(2024, 12, 1),
                TargetDate = new DateOnly(2025, 1, 31),
                Status = "in-progress",
                Progress = 60,
                Completed = false
            }
        };
    }
}
