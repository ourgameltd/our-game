using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerAgeGroupSeedData
{
    public static List<PlayerAgeGroup> GetPlayerAgeGroups()
    {
        return new List<PlayerAgeGroup>
        {
            // 2014 age group players
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.OliverThompson_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.JamesWilson_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.LucasMartinez_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.EthanDavies_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.NoahAnderson_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.CharlieRoberts_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.WilliamBrown_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.HarryTaylor_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.MasonEvans_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.AlexanderWhite_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.GeorgeHarris_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id },

            // 2012 age group player
            new PlayerAgeGroup { Id = Guid.NewGuid(), PlayerId = PlayerSeedData.CarlosRodriguez_Id, AgeGroupId = AgeGroupSeedData.AgeGroup2012_Id }
        };
    }
}
