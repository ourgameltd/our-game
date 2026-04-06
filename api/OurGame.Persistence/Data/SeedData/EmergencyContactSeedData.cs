using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class EmergencyContactSeedData
{
    public static List<EmergencyContact> GetEmergencyContacts()
    {
        var uniqueRelationships = UserSeedData.GetDataset().Guardians
            .GroupBy(guardian => $"{UserSeedData.NormalizeName(guardian.Player)}|{UserSeedData.NormalizeName(guardian.Name)}")
            .Select(group => group.First())
            .ToList();

        return uniqueRelationships.Select((guardian, index) =>
        {
            return new EmergencyContact
            {
                Id = UserSeedData.CreateDeterministicGuid($"emergency-contact|{UserSeedData.NormalizeName(guardian.Player)}|{UserSeedData.NormalizeName(guardian.Name)}"),
                PlayerId = PlayerSeedData.GetPlayerIdByName(guardian.Player),
                CoachId = null,
                UserId = null,
                Name = guardian.Name,
                Phone = string.IsNullOrWhiteSpace(guardian.Phone) ? null : UserSeedData.NormalizePhone(guardian.Phone),
                Relationship = "Parent",
                IsPrimary = index == 0 || uniqueRelationships.IndexOf(guardian) == 0
            };
        }).ToList();
    }
}
