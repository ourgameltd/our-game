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
        var now = DateTime.UtcNow;
        
        return new List<PlayerReport>
        {
            new PlayerReport
            {
                Id = Report1_Id,
                PlayerId = PlayerSeedData.CarlosRodriguez_Id,
                PeriodStart = new DateOnly(2024, 9, 1),
                PeriodEnd = new DateOnly(2024, 11, 30),
                OverallRating = 8.5m,
                Strengths = "[\"Excellent finishing ability with both feet\",\"Strong movement off the ball\",\"Good positioning in the box\",\"Effective at holding up play\",\"Confident on the ball under pressure\"]",
                AreasForImprovement = "[\"Aerial ability needs development\",\"Defensive contribution when team doesn't have the ball\",\"Decision making in final third could be quicker\",\"Physical conditioning - stamina in latter stages of games\"]",
                CoachComments = "Carlos has been exceptional this term with 12 goals in 10 games. His natural finishing ability is outstanding, and he's showing great maturity in his link-up play. The focus now should be on becoming a more complete forward by improving his aerial game and defensive work rate. If he can add these elements to his game, he has the potential to play at a higher level.",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                CreatedAt = now
            },
            new PlayerReport
            {
                Id = Report2_Id,
                PlayerId = PlayerSeedData.JamesWilson_Id,
                PeriodStart = new DateOnly(2024, 9, 1),
                PeriodEnd = new DateOnly(2024, 11, 30),
                OverallRating = 8.0m,
                Strengths = "[\"Excellent reading of the game\",\"Strong in the air\",\"Good distribution from the back\",\"Natural leader on the pitch\",\"Composed under pressure\"]",
                AreasForImprovement = "[\"Recovery pace when caught out of position\",\"Aggression levels could be higher\",\"Left foot passing accuracy\",\"Attacking set-piece contribution\"]",
                CoachComments = "James continues to develop into a commanding center-back. His reading of the game is exceptional for his age, and he's becoming a vocal leader in the defensive line. The focus for next term is improving his recovery pace and becoming more aggressive in duels.",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                CreatedAt = now
            },
            new PlayerReport
            {
                Id = Report3_Id,
                PlayerId = PlayerSeedData.LucasMartinez_Id,
                PeriodStart = new DateOnly(2024, 9, 1),
                PeriodEnd = new DateOnly(2024, 11, 30),
                OverallRating = 8.3m,
                Strengths = "[\"Exceptional passing range and vision\",\"Excellent ball control in tight spaces\",\"Strong work rate and stamina\",\"Good positioning without the ball\",\"Effective set-piece delivery\"]",
                AreasForImprovement = "[\"Decision making in final third\",\"Shooting accuracy from distance\",\"Physical strength in duels\",\"Defensive positioning when team loses possession\"]",
                CoachComments = "Sophie has been outstanding in central midfield this term. Her passing and vision are exceptional, and she controls the tempo of games beautifully. To reach the next level, she needs to add more goals and assists to her game and improve her defensive positioning.",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                CreatedAt = now
            }
        };
    }
}
