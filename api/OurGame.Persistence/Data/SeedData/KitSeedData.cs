using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class KitSeedData
{
    // Vale FC Kit IDs
    public static readonly Guid ValeHomeKit_Id = Guid.Parse("9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d");
    public static readonly Guid ValeAwayKit_Id = Guid.Parse("9b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e");
    public static readonly Guid ValeGKKit_Id = Guid.Parse("9d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a");
    
    // Renton United Kit IDs
    public static readonly Guid RentonHomeKit_Id = Guid.Parse("8a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d");
    public static readonly Guid RentonGKKit_Id = Guid.Parse("8b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e");

    public static List<Kit> GetKits()
    {
        var now = DateTime.UtcNow;
        
        return new List<Kit>
        {
            // Vale FC Kits
            new Kit
            {
                Id = ValeHomeKit_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                TeamId = null,
                Name = "Vale Home Kit",
                Type = KitType.Home,
                ShirtColor = "#000080",
                ShortsColor = "#000080",
                SocksColor = "#000080",
                Season = null,
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
                ShortsColor = "#000080",
                SocksColor = "#000080",
                Season = null,
                IsActive = true,
                CreatedAt = now
            },
            new Kit
            {
                Id = ValeGKKit_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                TeamId = null,
                Name = "Vale Goalkeeper Kit",
                Type = KitType.Goalkeeper,
                ShirtColor = "#00FF00",
                ShortsColor = "#00FF00",
                SocksColor = "#00FF00",
                Season = null,
                IsActive = true,
                CreatedAt = now
            },
            
            // Renton United Kits
            new Kit
            {
                Id = RentonHomeKit_Id,
                ClubId = ClubSeedData.RentonUnited_Id,
                TeamId = null,
                Name = "Renton Home Kit",
                Type = KitType.Home,
                ShirtColor = "#CC0014",
                ShortsColor = "#000000",
                SocksColor = "#CC0014",
                Season = null,
                IsActive = true,
                CreatedAt = now
            },
            new Kit
            {
                Id = RentonGKKit_Id,
                ClubId = ClubSeedData.RentonUnited_Id,
                TeamId = null,
                Name = "Renton Goalkeeper Kit",
                Type = KitType.Goalkeeper,
                ShirtColor = "#00ff00",
                ShortsColor = "#000000",
                SocksColor = "#00ff00",
                Season = null,
                IsActive = true,
                CreatedAt = now
            }
        };
    }
}
