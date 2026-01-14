using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class GoalSeedData
{
    public static List<Goal> GetGoals()
    {
        return new List<Goal>
        {
            // Match 3 goals (3-0 win)
            new Goal
            {
                Id = Guid.NewGuid(),
                MatchReportId = MatchReportSeedData.Match3_Report_Id,
                PlayerId = PlayerSeedData.NoahAnderson_Id,
                AssistPlayerId = PlayerSeedData.EthanDavies_Id,
                Minute = 23
            },
            new Goal
            {
                Id = Guid.NewGuid(),
                MatchReportId = MatchReportSeedData.Match3_Report_Id,
                PlayerId = PlayerSeedData.NoahAnderson_Id,
                AssistPlayerId = PlayerSeedData.CharlieRoberts_Id,
                Minute = 67
            },
            new Goal
            {
                Id = Guid.NewGuid(),
                MatchReportId = MatchReportSeedData.Match3_Report_Id,
                PlayerId = PlayerSeedData.GeorgeHarris_Id,
                AssistPlayerId = null,
                Minute = 82
            }
        };
    }
}
