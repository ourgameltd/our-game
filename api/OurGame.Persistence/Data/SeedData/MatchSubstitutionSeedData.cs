using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class MatchSubstitutionSeedData
{
    public static List<MatchSubstitution> GetSubstitutions()
    {
        return new List<MatchSubstitution>
        {
            // Substitution in Match 3
            new MatchSubstitution
            {
                Id = Guid.NewGuid(),
                MatchId = MatchSeedData.Match3_Id,
                PlayerOutId = PlayerSeedData.EthanDavies_Id,
                PlayerInId = PlayerSeedData.CharlieRoberts_Id,
                Minute = 75
            }
        };
    }
}
