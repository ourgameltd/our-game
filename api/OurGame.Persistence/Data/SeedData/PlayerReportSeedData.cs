using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerReportSeedData
{
    public static readonly Guid Report1_Id = Guid.Parse("e1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid Report2_Id = Guid.Parse("e2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
    public static readonly Guid Report3_Id = Guid.Parse("e3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8");

    public static List<PlayerReport> GetPlayerReports()
    {
        return new List<PlayerReport>();
    }
}
