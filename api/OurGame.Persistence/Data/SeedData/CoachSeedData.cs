using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class CoachSeedData
{
    public static readonly Guid MichaelRobertson_Id = UserSeedData.CreateDeterministicGuid("coach|michael-robertson");

    public static Guid GetCoachIdByAdminName(string adminName)
    {
        return UserSeedData.CreateDeterministicGuid($"coach|{UserSeedData.NormalizeName(adminName)}");
    }

    public static List<Coach> GetCoaches()
    {
        var now = DateTime.UtcNow;

        var coaches = new List<Coach>
        {
            new Coach
            {
                Id = MichaelRobertson_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                FirstName = "Michael",
                LastName = "Robertson",
                DateOfBirth = null,
                Photo = null,
                Email = "michael.robertson@valefc.com",
                Phone = string.Empty,
                AssociationId = UserSeedData.GetSafeCoachAssociationId("Michael Robertson"),
                HasAccount = false,
                Role = CoachRole.HeadCoach,
                Biography = "Seeded legacy coach used by tactic seed data.",
                Specializations = "[]",
                UserId = null,
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            }
        };

        var mergedAdmins = UserSeedData.GetDataset().Admins
            .GroupBy(admin => UserSeedData.NormalizeName(admin.Name))
            .Select(group => group.First())
            .OrderBy(admin => admin.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();

        foreach (var admin in mergedAdmins)
        {
            var (firstName, lastName) = SplitName(admin.Name);
            var isMichaelLaw = UserSeedData.NormalizeName(admin.Name) == "michael law";

            coaches.Add(new Coach
            {
                Id = GetCoachIdByAdminName(admin.Name),
                ClubId = ClubSeedData.ValeFC_Id,
                FirstName = firstName,
                LastName = lastName,
                DateOfBirth = null,
                Photo = null,
                Email = UserSeedData.GetSafeAdminEmail(admin.Name, admin.Email, admin.Phone),
                Phone = UserSeedData.NormalizePhone(admin.Phone),
                AssociationId = UserSeedData.GetSafeCoachAssociationId(admin.Name, admin.AssociationId),
                HasAccount = isMichaelLaw,
                Role = CoachRole.HeadCoach,
                Biography = "Seeded from Vale of Leven administrator data.",
                Specializations = "[]",
                UserId = isMichaelLaw ? UserSeedData.MichaelLaw_Id : null,
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        return coaches;
    }

    private static (string FirstName, string LastName) SplitName(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length == 0)
        {
            return ("Unknown", "Coach");
        }

        if (parts.Length == 1)
        {
            return (parts[0], "Coach");
        }

        return (parts[0], string.Join(' ', parts.Skip(1)));
    }
}
