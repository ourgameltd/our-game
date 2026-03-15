using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class TrainingPlanSeedData
{
    public static readonly Guid Plan1_CarlosSilva_Id = Guid.Parse("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d");
    public static readonly Guid Plan2_MasonEvans_Id = Guid.Parse("a2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
    
    public static List<TrainingPlan> GetTrainingPlans()
    {
        return new List<TrainingPlan>();
    }
}
