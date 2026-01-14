using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class TrainingPlanSeedData
{
    public static readonly Guid Plan1_CarlosSilva_Id = Guid.Parse("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d");
    public static readonly Guid Plan2_MasonEvans_Id = Guid.Parse("a2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
    
    public static List<TrainingPlan> GetTrainingPlans()
    {
        var now = DateTime.UtcNow;
        
        return new List<TrainingPlan>
        {
            // Training plan for Carlos Silva - focusing on aerial ability and defensive work rate
            new TrainingPlan
            {
                Id = Plan1_CarlosSilva_Id,
                PlayerId = PlayerSeedData.MasonEvans_Id, // Using existing player
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                PeriodStart = new DateOnly(2024, 12, 1),
                PeriodEnd = new DateOnly(2025, 2, 28),
                Status = "active",
                CreatedAt = new DateTime(2024, 12, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 12, 6, 0, 0, 0, DateTimeKind.Utc)
            },
            // Training plan for another player - goal contributions
            new TrainingPlan
            {
                Id = Plan2_MasonEvans_Id,
                PlayerId = PlayerSeedData.NoahAnderson_Id,
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                PeriodStart = new DateOnly(2024, 12, 1),
                PeriodEnd = new DateOnly(2025, 2, 28),
                Status = "active",
                CreatedAt = new DateTime(2024, 12, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 12, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        };
    }
}
