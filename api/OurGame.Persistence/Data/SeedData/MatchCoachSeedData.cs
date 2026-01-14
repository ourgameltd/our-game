using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class MatchCoachSeedData
{
    public static List<MatchCoach> GetMatchCoaches()
    {
        return new List<MatchCoach>
        {
            // Match 1 - Vale FC First Team vs Riverside United (3 coaches)
            new MatchCoach
            {
                Id = Guid.NewGuid(),
                MatchId = MatchSeedData.Match1_Id,
                CoachId = CoachSeedData.MichaelRobertson_Id
            },
            new MatchCoach
            {
                Id = Guid.NewGuid(),
                MatchId = MatchSeedData.Match1_Id,
                CoachId = CoachSeedData.SarahMcKenzie_Id
            },
            new MatchCoach
            {
                Id = Guid.NewGuid(),
                MatchId = MatchSeedData.Match1_Id,
                CoachId = CoachSeedData.DavidCampbell_Id
            },
            // Match 2 - Vale Reds vs Hillside Youth (2 coaches)
            new MatchCoach
            {
                Id = Guid.NewGuid(),
                MatchId = MatchSeedData.Match2_Id,
                CoachId = CoachSeedData.EmmaWilson_Id
            },
            new MatchCoach
            {
                Id = Guid.NewGuid(),
                MatchId = MatchSeedData.Match2_Id,
                CoachId = CoachSeedData.DavidCampbell_Id
            },
            // Match 3 - Vale First Team vs Oakwood Athletic (1 coach)
            new MatchCoach
            {
                Id = Guid.NewGuid(),
                MatchId = MatchSeedData.Match3_Id,
                CoachId = CoachSeedData.MichaelRobertson_Id
            },
            // Match 4 - Vale Reds vs Greenfield Rangers (1 coach)
            new MatchCoach
            {
                Id = Guid.NewGuid(),
                MatchId = MatchSeedData.Match4_Id,
                CoachId = CoachSeedData.MichaelRobertson_Id
            },
            // Match 5 - Vale Blues vs Brookside United (1 coach)
            new MatchCoach
            {
                Id = Guid.NewGuid(),
                MatchId = MatchSeedData.Match5_Id,
                CoachId = CoachSeedData.MichaelRobertson_Id
            }
        };
    }
}
