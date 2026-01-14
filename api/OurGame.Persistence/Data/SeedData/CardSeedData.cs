using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class CardSeedData
{
    public static List<Card> GetCards()
    {
        return new List<Card>
        {
            // Match 3 - Yellow card
            new Card
            {
                Id = Guid.NewGuid(),
                MatchReportId = MatchReportSeedData.Match3_Report_Id,
                PlayerId = PlayerSeedData.EthanDavies_Id,
                Type = CardType.Yellow,
                Minute = 55,
                Reason = "Tactical foul"
            }
        };
    }
}
