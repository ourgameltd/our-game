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
        return new List<Kit>();
    }
}
