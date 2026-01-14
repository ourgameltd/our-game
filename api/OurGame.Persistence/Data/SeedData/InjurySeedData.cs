using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class InjurySeedData
{
    public static List<Injury> GetInjuries()
    {
        return new List<Injury>
        {
            // Match injury from TypeScript data
            new Injury
            {
                Id = Guid.NewGuid(),
                MatchReportId = MatchReportSeedData.Match3_Report_Id,
                PlayerId = PlayerSeedData.CharlieRoberts_Id,
                Minute = 52,
                Description = "Ankle sprain",
                Severity = Severity.Minor
            }
        };
    }
}
