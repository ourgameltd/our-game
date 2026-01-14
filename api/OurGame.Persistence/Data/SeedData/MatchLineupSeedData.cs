using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class MatchLineupSeedData
{
    public static readonly Guid Match3_Lineup_Id = Guid.Parse("b1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    
    public static List<MatchLineup> GetMatchLineups()
    {
        var now = DateTime.UtcNow;
        
        return new List<MatchLineup>
        {
            new MatchLineup
            {
                Id = Match3_Lineup_Id,
                MatchId = MatchSeedData.Match3_Id,
                FormationId = FormationSeedData.Formation_442_Classic_Id,
                TacticId = null,
            }
        };
    }
}
