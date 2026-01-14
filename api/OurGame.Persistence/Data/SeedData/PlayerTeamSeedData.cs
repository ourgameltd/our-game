using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerTeamSeedData
{
    public static List<PlayerTeam> GetPlayerTeams()
    {
        return new List<PlayerTeam>
        {
            // Reds 2014 team assignments (from TypeScript playerAssignments)
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.OliverThompson_Id, TeamId = TeamSeedData.Reds2014_Id, SquadNumber = 1, AssignedAt = DateTime.UtcNow },
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.JamesWilson_Id, TeamId = TeamSeedData.Reds2014_Id, SquadNumber = 4, AssignedAt = DateTime.UtcNow },
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.LucasMartinez_Id, TeamId = TeamSeedData.Reds2014_Id, SquadNumber = 7, AssignedAt = DateTime.UtcNow },
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.EthanDavies_Id, TeamId = TeamSeedData.Reds2014_Id, SquadNumber = 9, AssignedAt = DateTime.UtcNow },
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.NoahAnderson_Id, TeamId = TeamSeedData.Reds2014_Id, SquadNumber = 10, AssignedAt = DateTime.UtcNow },
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.CharlieRoberts_Id, TeamId = TeamSeedData.Reds2014_Id, SquadNumber = 11, AssignedAt = DateTime.UtcNow },

            // Whites 2014 team assignments
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.CharlieRoberts_Id, TeamId = TeamSeedData.Whites2014_Id, SquadNumber = 7, AssignedAt = DateTime.UtcNow },
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.WilliamBrown_Id, TeamId = TeamSeedData.Whites2014_Id, SquadNumber = 8, AssignedAt = DateTime.UtcNow },
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.HarryTaylor_Id, TeamId = TeamSeedData.Whites2014_Id, SquadNumber = 9, AssignedAt = DateTime.UtcNow },

            // Blues 2014 team assignments (archived team)
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.MasonEvans_Id, TeamId = TeamSeedData.Blues2014_Id, SquadNumber = 2, AssignedAt = DateTime.UtcNow },
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.AlexanderWhite_Id, TeamId = TeamSeedData.Blues2014_Id, SquadNumber = 5, AssignedAt = DateTime.UtcNow },
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.GeorgeHarris_Id, TeamId = TeamSeedData.Blues2014_Id, SquadNumber = 6, AssignedAt = DateTime.UtcNow },

            // Reds 2013 team - Carlos Rodriguez
            new PlayerTeam { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.CarlosRodriguez_Id, TeamId = TeamSeedData.Reds2013_Id, SquadNumber = 10, AssignedAt = DateTime.UtcNow }
        };
    }
}
