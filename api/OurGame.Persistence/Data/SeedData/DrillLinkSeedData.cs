using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class DrillLinkSeedData
{
    public static List<DrillLink> GetDrillLinks()
    {
        return new List<DrillLink>
        {
            // Links for Passing Triangle drill
            new DrillLink
            {
                Id = Guid.NewGuid(),
                DrillId = DrillSeedData.PassingTriangle_Id,
                Url = "https://www.youtube.com/watch?v=example1",
                Title = "Passing Triangle Tutorial - Pro Coach Tips",
                Type = "youtube"
            },
            // Links for Dribbling Gates drill
            new DrillLink
            {
                Id = Guid.NewGuid(),
                DrillId = DrillSeedData.DribblingGates_Id,
                Url = "https://www.instagram.com/reel/example",
                Title = "Dribbling Gates Demo",
                Type = "instagram"
            }
        };
    }
}
