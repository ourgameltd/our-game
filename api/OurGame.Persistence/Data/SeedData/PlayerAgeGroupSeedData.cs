using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerAgeGroupSeedData
{
    public static List<PlayerAgeGroup> GetPlayerAgeGroups()
    {
        return PlayerSeedData.GetSourcePlayers()
            .Select(player => new PlayerAgeGroup
            {
                Id = UserSeedData.CreateDeterministicGuid($"player-age-group|{UserSeedData.NormalizeName(player.Name)}|{AgeGroupSeedData.AgeGroup2014_Id:N}"),
                PlayerId = PlayerSeedData.GetPlayerIdByName(player.Name),
                AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id
            })
            .ToList();
    }
}
