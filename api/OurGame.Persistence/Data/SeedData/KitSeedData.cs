using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class KitSeedData
{
    // Vale FC Kit IDs
    public static readonly Guid ValeHomeKit_Id = UserSeedData.CreateDeterministicGuid("kit|vale-fc|2024/25|home");
    public static readonly Guid ValeAwayKit_Id = UserSeedData.CreateDeterministicGuid("kit|vale-fc|2024/25|away");
    public static readonly Guid ValeHomeGoalkeeperKit_Id = UserSeedData.CreateDeterministicGuid("kit|vale-fc|2024/25|goalkeeper|home");
    public static readonly Guid ValeAwayGoalkeeperKit_Id = UserSeedData.CreateDeterministicGuid("kit|vale-fc|2024/25|goalkeeper|away");

    public static List<Kit> GetKits()
    {
        var now = DateTime.UtcNow;

        return new List<Kit>
        {
            new Kit
            {
                Id = ValeHomeKit_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                TeamId = null,
                Name = "Vale Home Kit",
                Type = KitType.Home,
                ShirtColor = "#352065",
                ShortsColor = "#352065",
                SocksColor = "#352065",
                Season = "2024/25",
                IsActive = true,
                CreatedAt = now
            },
            new Kit
            {
                Id = ValeAwayKit_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                TeamId = null,
                Name = "Vale Away Kit",
                Type = KitType.Away,
                ShirtColor = "#87CEEB",
                ShortsColor = "#87CEEB",
                SocksColor = "#87CEEB",
                Season = "2024/25",
                IsActive = true,
                CreatedAt = now
            },
            new Kit
            {
                Id = ValeHomeGoalkeeperKit_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                TeamId = null,
                Name = "Vale Home Goalkeeper Kit",
                Type = KitType.Goalkeeper,
                ShirtColor = "#FFD700",
                ShortsColor = "#FFD700",
                SocksColor = "#FFD700",
                Season = "2024/25",
                IsActive = true,
                CreatedAt = now
            },
            new Kit
            {
                Id = ValeAwayGoalkeeperKit_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                TeamId = null,
                Name = "Vale Away Goalkeeper Kit",
                Type = KitType.Goalkeeper,
                ShirtColor = "#32CD32",
                ShortsColor = "#32CD32",
                SocksColor = "#32CD32",
                Season = "2024/25",
                IsActive = true,
                CreatedAt = now
            }
        };
    }
}
