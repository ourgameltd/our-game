using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class SessionDrillSeedData
{
    public static List<SessionDrill> GetSessionDrills()
    {
        var now = DateTime.UtcNow;
        
        return new List<SessionDrill>
        {
            // Technical Session drills
            new SessionDrill
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session1_Technical_Id,
                DrillId = DrillSeedData.Drill_PassingSquares_Id,
                DrillOrder = 1,
                
                
            },
            new SessionDrill
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session1_Technical_Id,
                DrillId = DrillSeedData.Drill_1v1_Id,
                DrillOrder = 2,
                
                
            },
            // Tactical Session drills
            new SessionDrill
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session2_Tactical_Id,
                DrillId = DrillSeedData.Drill_PositionalPlay_Id,
                DrillOrder = 1,
                
                
            },
            new SessionDrill
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session2_Tactical_Id,
                DrillId = DrillSeedData.Drill_SmallSidedGame_Id,
                DrillOrder = 2,
                
                
            },
            // Fitness Session drills
            new SessionDrill
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session3_Fitness_Id,
                DrillId = DrillSeedData.Drill_CoordinationLadder_Id,
                DrillOrder = 1,
                
                
            },
            new SessionDrill
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session3_Fitness_Id,
                DrillId = DrillSeedData.Drill_SmallSidedGame_Id,
                DrillOrder = 2,
                
                
            }
        };
    }
}
