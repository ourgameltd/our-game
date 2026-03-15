using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerParentSeedData
{
    public static List<PlayerParent> GetPlayerParents()
    {
        var uniqueRelationships = UserSeedData.GetDataset().Guardians
            .GroupBy(guardian => $"{UserSeedData.NormalizeName(guardian.Player)}|{UserSeedData.NormalizeName(guardian.Name)}")
            .Select(group => group.First())
            .ToList();

        return uniqueRelationships.Select(guardian => new PlayerParent
        {
            Id = UserSeedData.CreateDeterministicGuid($"player-parent|{UserSeedData.NormalizeName(guardian.Player)}|{UserSeedData.NormalizeName(guardian.Name)}"),
            PlayerId = PlayerSeedData.GetPlayerIdByName(guardian.Player),
            ParentUserId = UserSeedData.GetGuardianUserId(guardian.Name)
        }).ToList();
    }
}
