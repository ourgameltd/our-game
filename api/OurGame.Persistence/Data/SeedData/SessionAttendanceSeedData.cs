using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class SessionAttendanceSeedData
{
    public static List<SessionAttendance> GetSessionAttendance()
    {
        var now = DateTime.UtcNow;
        
        return new List<SessionAttendance>
        {
            // Session 1 attendance
            new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session1_Technical_Id,
                PlayerId = PlayerSeedData.MasonEvans_Id,
                Present = true,
                Notes = null,
            },
            new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session1_Technical_Id,
                PlayerId = PlayerSeedData.AlexanderWhite_Id,
                Present = true,
                Notes = null,
            },
            new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session1_Technical_Id,
                PlayerId = PlayerSeedData.GeorgeHarris_Id,
                Present = true,
                Notes = null,
            },
            new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session1_Technical_Id,
                PlayerId = PlayerSeedData.CarlosRodriguez_Id,
                Present = false,
                Notes = "Ill",
            },
            new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session1_Technical_Id,
                PlayerId = PlayerSeedData.OliverThompson_Id,
                Present = true,
                Notes = null,
            },
            // Session 2 attendance
            new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session2_Tactical_Id,
                PlayerId = PlayerSeedData.MasonEvans_Id,
                Present = true,
                Notes = null,
            },
            new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session2_Tactical_Id,
                PlayerId = PlayerSeedData.AlexanderWhite_Id,
                Present = true,
                Notes = null,
            },
            new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session2_Tactical_Id,
                PlayerId = PlayerSeedData.GeorgeHarris_Id,
                Present = true,
                Notes = null,
            },
            new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session2_Tactical_Id,
                PlayerId = PlayerSeedData.CarlosRodriguez_Id,
                Present = true,
                Notes = null,
            },
            new SessionAttendance
            {
                Id = Guid.NewGuid(),
                SessionId = TrainingSessionSeedData.Session2_Tactical_Id,
                PlayerId = PlayerSeedData.OliverThompson_Id,
                Present = true,
                Notes = "Arrived 10 mins late"
            }
        };
    }
}
