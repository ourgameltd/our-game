using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class TrainingSessionSeedData
{
    // Training Session IDs
    public static readonly Guid Session1_Technical_Id = Guid.Parse("00a1b2c3-d4e5-f6a7-b8c9-c0d1e2f3a4b5");
    public static readonly Guid Session2_Tactical_Id = Guid.Parse("01a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid Session3_Fitness_Id = Guid.Parse("02b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");

    public static List<TrainingSession> GetTrainingSessions()
    {
        return new List<TrainingSession>();
    }
}
