using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class TacticSeedData
{
    // Tactic IDs (tactics are formations with parentFormationId)
    public static readonly Guid Tactic1_Balanced_Id = Guid.Parse("t1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid Tactic2_Attacking_Id = Guid.Parse("t2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");

    public static List<Formation> GetTactics()
    {
        var now = DateTime.UtcNow;
        
        return new List<Formation>
        {
            // Club-Level Tactic: High Press 4-4-2
            new Formation
            {
                Id = Tactic1_Balanced_Id,
                Name = "High Press 4-4-2",
                System = "4-4-2",
                SquadSize = SquadSize.ElevenASide,
                ParentFormationId = FormationSeedData.Formation_442_Classic_Id,
                Summary = "Vale FC's signature high-pressing system designed to win the ball back quickly in the opponent's half.",
                Description = "The strikers initiate aggressive pressing on opposition center backs while the midfield stays compact to support. When we win the ball, we look to transition quickly and attack immediately.",
                Style = "High Press",
                IsSystemFormation = false,
                ScopeType = ScopeType.Club,
                ScopeClubId = ClubSeedData.ValeFC_Id,
                Tags = "[\"pressing\",\"attacking\",\"4-4-2\"]",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                CreatedAt = new DateTime(2024, 9, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 9, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            // Team-Level Tactic: Blues High Press (inherits from club tactic)
            new Formation
            {
                Id = Tactic2_Attacking_Id,
                Name = "Blues High Press",
                System = "4-4-2",
                SquadSize = SquadSize.ElevenASide,
                ParentFormationId = FormationSeedData.Formation_442_Classic_Id,
                ParentTacticId = Tactic1_Balanced_Id,
                Summary = "Team-specific adaptation of club high press tactics for Blues team.",
                Description = "Modified high press with specific player roles and adjusted positions for Blues team strengths.",
                Style = "High Press",
                IsSystemFormation = false,
                ScopeType = ScopeType.Team,
                ScopeClubId = ClubSeedData.ValeFC_Id,
                ScopeAgeGroupId = AgeGroupSeedData.AgeGroup2014_Id,
                ScopeTeamId = TeamSeedData.Blues2014_Id,
                Tags = "[\"pressing\",\"attacking\",\"4-4-2\"]",
                CreatedBy = CoachSeedData.MichaelRobertson_Id,
                CreatedAt = new DateTime(2024, 9, 10, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 9, 20, 0, 0, 0, DateTimeKind.Utc)
            }
        };
    }
}
