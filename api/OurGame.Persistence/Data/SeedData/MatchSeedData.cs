using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class MatchSeedData
{
    // Match IDs from TypeScript data
    public static readonly Guid Match1_Id = Guid.Parse("a1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid Match2_Id = Guid.Parse("a2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
    public static readonly Guid Match3_Id = Guid.Parse("a3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8");
    public static readonly Guid Match4_Id = Guid.Parse("a4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9");
    public static readonly Guid Match5_Id = Guid.Parse("a5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0");

    public static List<Match> GetMatches()
    {
        return new List<Match>();
    }
}
