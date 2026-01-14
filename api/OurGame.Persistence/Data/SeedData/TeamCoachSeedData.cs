using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class TeamCoachSeedData
{
    public static List<TeamCoach> GetTeamCoaches()
    {
        return new List<TeamCoach>
        {
            // Michael Robertson - Reds 2014 (head coach from TypeScript coaches data)
            new TeamCoach 
            { 
                Id = Guid.NewGuid(),
                TeamId = TeamSeedData.Reds2014_Id, 
                CoachId = CoachSeedData.MichaelRobertson_Id, 
                AssignedAt = new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc)
            },

            // David Campbell - Multiple teams (goalkeeper coach)
            new TeamCoach 
            { 
                Id = Guid.NewGuid(),
                TeamId = TeamSeedData.Reds2014_Id, 
                CoachId = CoachSeedData.DavidCampbell_Id, 
                AssignedAt = new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new TeamCoach 
            { 
                Id = Guid.NewGuid(),
                TeamId = TeamSeedData.Blues2014_Id, 
                CoachId = CoachSeedData.DavidCampbell_Id, 
                AssignedAt = new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc)
            },

            // Emma Wilson - Blues 2014 (head coach)
            new TeamCoach 
            { 
                Id = Guid.NewGuid(),
                TeamId = TeamSeedData.Blues2014_Id, 
                CoachId = CoachSeedData.EmmaWilson_Id, 
                AssignedAt = new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc)
            },

            // James Anderson - Senior Team (head coach)
            new TeamCoach 
            { 
                Id = Guid.NewGuid(),
                TeamId = TeamSeedData.FirstTeam_Id, 
                CoachId = CoachSeedData.JamesAnderson_Id, 
                AssignedAt = new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc)
            },

            // Laura Thomson - Multiple teams (fitness coach)
            new TeamCoach 
            { 
                Id = Guid.NewGuid(),
                TeamId = TeamSeedData.Reds2014_Id, 
                CoachId = CoachSeedData.LauraThomson_Id, 
                AssignedAt = new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new TeamCoach 
            { 
                Id = Guid.NewGuid(),
                TeamId = TeamSeedData.Blues2014_Id, 
                CoachId = CoachSeedData.LauraThomson_Id, 
                AssignedAt = new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new TeamCoach 
            { 
                Id = Guid.NewGuid(),
                TeamId = TeamSeedData.Reds2013_Id, 
                CoachId = CoachSeedData.LauraThomson_Id, 
                AssignedAt = new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        };
    }
}
