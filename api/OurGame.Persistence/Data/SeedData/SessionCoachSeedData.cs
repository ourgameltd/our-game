using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class SessionCoachSeedData
{
    public static List<SessionCoach> GetSessionCoaches()
    {
        return new List<SessionCoach>
        {
            // Training session 1 - Michael Robertson (Head Coach)
            new SessionCoach
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session1_Technical_Id,
                CoachId = CoachSeedData.MichaelRobertson_Id
            },
            // Training session 2 - Michael Robertson + Sarah McKenzie (Assistant Coach)
            new SessionCoach
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session2_Tactical_Id,
                CoachId = CoachSeedData.MichaelRobertson_Id
            },
            new SessionCoach
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session2_Tactical_Id,
                CoachId = CoachSeedData.SarahMcKenzie_Id
            },
            // Training session 3 - Michael Robertson
            new SessionCoach
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session3_Fitness_Id,
                CoachId = CoachSeedData.MichaelRobertson_Id
            }
        };
    }
}
