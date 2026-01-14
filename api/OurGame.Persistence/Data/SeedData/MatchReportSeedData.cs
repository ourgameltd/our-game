using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class MatchReportSeedData
{
    public static readonly Guid Match3_Report_Id = Guid.Parse("c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid Match5_Report_Id = Guid.Parse("c2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
    
    public static List<MatchReport> GetMatchReports()
    {
        var now = DateTime.UtcNow;
        
        return new List<MatchReport>
        {
            new MatchReport
            {
                Id = Match3_Report_Id,
                MatchId = MatchSeedData.Match3_Id,
                Summary = "Dominant performance from the Reds with excellent teamwork. Strong defensive display kept Rangers at bay.",
                CaptainId = PlayerSeedData.JamesWilson_Id,
                PlayerOfMatchId = PlayerSeedData.NoahAnderson_Id,
                
                CreatedAt = now,
            },
            new MatchReport
            {
                Id = Match5_Report_Id,
                MatchId = MatchSeedData.Match5_Id,
                Summary = "Comprehensive victory with a clean sheet. Outstanding performance from the whole team.",
                CaptainId = PlayerSeedData.JamesWilson_Id,
                PlayerOfMatchId = PlayerSeedData.NoahAnderson_Id,
                
                CreatedAt = now,
            }
        };
    }
}
