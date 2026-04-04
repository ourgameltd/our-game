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

        return uniqueRelationships.Select(guardian =>
        {
            var (firstName, lastName) = SplitName(guardian.Name);

            return new PlayerParent
            {
                Id = UserSeedData.CreateDeterministicGuid($"player-parent|{UserSeedData.NormalizeName(guardian.Player)}|{UserSeedData.NormalizeName(guardian.Name)}"),
                PlayerId = PlayerSeedData.GetPlayerIdByName(guardian.Player),
                ParentUserId = null,
                FirstName = firstName,
                LastName = lastName,
                Email = string.IsNullOrWhiteSpace(guardian.Email) ? null : UserSeedData.NormalizeEmail(guardian.Email),
                Phone = string.IsNullOrWhiteSpace(guardian.Phone) ? null : UserSeedData.NormalizePhone(guardian.Phone)
            };
        }).ToList();
    }

    private static (string FirstName, string LastName) SplitName(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length == 0)
        {
            return ("Unknown", "Parent");
        }

        if (parts.Length == 1)
        {
            return (parts[0], "Parent");
        }

        return (parts[0], string.Join(' ', parts.Skip(1)));
    }
}
