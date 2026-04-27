using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class DrillLinkSeedData
{
    public static List<DrillLink> GetDrillLinks()
    {
        return new List<DrillLink>
        {
            new DrillLink
            {
                Id = Guid.Parse("d101a2b3-c4d5-e6f7-a8b9-c0d1e2f3a4b5"),
                DrillId = DrillSeedData.PassingTriangle_Id,
                Url = "https://www.youtube.com/watch?v=passing-triangle-demo",
                Title = "Passing Triangle Tutorial - Pro Coach Tips",
                Type = LinkType.Youtube
            },
            new DrillLink
            {
                Id = Guid.Parse("d102b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6"),
                DrillId = DrillSeedData.DribblingGates_Id,
                Url = "https://www.instagram.com/reel/dribbling-gates-demo",
                Title = "Dribbling Gates Demo",
                Type = LinkType.Instagram
            },
            new DrillLink
            {
                Id = Guid.Parse("d103c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7"),
                DrillId = DrillSeedData.Possession5v5_Id,
                Url = "https://www.youtube.com/watch?v=possession-drill",
                Title = "5v5 Possession Game Coaching Guide",
                Type = LinkType.Youtube
            },
            new DrillLink
            {
                Id = Guid.Parse("d104d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8"),
                DrillId = DrillSeedData.FinishingCircuit_Id,
                Url = "https://www.youtube.com/watch?v=finishing-circuit",
                Title = "Finishing Circuit - Shooting Drills",
                Type = LinkType.Youtube
            },
            new DrillLink
            {
                Id = Guid.Parse("d105e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9"),
                DrillId = DrillSeedData.DefensiveShape_Id,
                Url = "https://www.youtube.com/watch?v=defensive-shape",
                Title = "Defensive Shape & Positioning",
                Type = LinkType.Youtube
            },
            new DrillLink
            {
                Id = Guid.Parse("d106f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0"),
                DrillId = DrillSeedData.CrossingFinishing_Id,
                Url = "https://www.youtube.com/watch?v=crossing-finishing",
                Title = "Crossing & Finishing Techniques",
                Type = LinkType.Youtube
            },
        };
    }
}
