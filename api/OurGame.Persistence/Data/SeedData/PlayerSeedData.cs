using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerSeedData
{
    // Player IDs from TypeScript data
    public static readonly Guid OliverThompson_Id = Guid.Parse("a1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid JamesWilson_Id = Guid.Parse("a2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
    public static readonly Guid LucasMartinez_Id = Guid.Parse("a3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8");
    public static readonly Guid EthanDavies_Id = Guid.Parse("a4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9");
    public static readonly Guid NoahAnderson_Id = Guid.Parse("a5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0");
    public static readonly Guid CharlieRoberts_Id = Guid.Parse("a6f7a8b9-c0d1-e2f3-a4b5-c6d7e8f9a0b1");
    public static readonly Guid WilliamBrown_Id = Guid.Parse("a7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2");
    public static readonly Guid HarryTaylor_Id = Guid.Parse("a8b9c0d1-e2f3-a4b5-c6d7-e8f9a0b1c2d3");
    public static readonly Guid MasonEvans_Id = Guid.Parse("a9c0d1e2-f3a4-b5c6-d7e8-f9a0b1c2d3e4");
    public static readonly Guid AlexanderWhite_Id = Guid.Parse("ab0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f");
    public static readonly Guid GeorgeHarris_Id = Guid.Parse("ac1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a");
    public static readonly Guid CarlosRodriguez_Id = Guid.Parse("ad21a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6");

    public static List<Player> GetPlayers()
    {
        var clubId = ClubSeedData.ValeFC_Id;
        var now = DateTime.UtcNow;

        return new List<Player>
        {
            // Oliver Thompson - The Wall (GK)
            new Player
            {
                Id = OliverThompson_Id,
                ClubId = clubId,
                FirstName = "Oliver",
                LastName = "Thompson",
                Nickname = "The Wall",
                DateOfBirth = new DateOnly(2014, 3, 15),
                Photo = "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
                AssociationId = "SFA-Y-40123",
                PreferredPositions = "[\"GK\"]",
                OverallRating = 50,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // James Wilson (CB/RB)
            new Player
            {
                Id = JamesWilson_Id,
                ClubId = clubId,
                FirstName = "James",
                LastName = "Wilson",
                Nickname = null,
                DateOfBirth = new DateOnly(2014, 7, 22),
                Photo = null,
                AssociationId = null,
                PreferredPositions = "[\"CB\",\"RB\"]",
                OverallRating = 54,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // Lucas Martinez - Lucky (CB/LB)
            new Player
            {
                Id = LucasMartinez_Id,
                ClubId = clubId,
                FirstName = "Lucas",
                LastName = "Martinez",
                Nickname = "Lucky",
                DateOfBirth = new DateOnly(2014, 4, 20),
                Photo = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
                AssociationId = "SFA-Y-40156",
                PreferredPositions = "[\"CB\",\"LB\"]",
                OverallRating = 56,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // Ethan Davies (CM/CAM)
            new Player
            {
                Id = EthanDavies_Id,
                ClubId = clubId,
                FirstName = "Ethan",
                LastName = "Davies",
                Nickname = null,
                DateOfBirth = new DateOnly(2014, 5, 18),
                Photo = null,
                AssociationId = "SFA-Y-40189",
                PreferredPositions = "[\"CM\",\"CAM\"]",
                OverallRating = 57,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // Noah Anderson - Rocket (ST/CF)
            new Player
            {
                Id = NoahAnderson_Id,
                ClubId = clubId,
                FirstName = "Noah",
                LastName = "Anderson",
                Nickname = "Rocket",
                DateOfBirth = new DateOnly(2014, 6, 10),
                Photo = "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah",
                AssociationId = "SFA-Y-40201",
                PreferredPositions = "[\"ST\",\"CF\"]",
                OverallRating = 62,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // Charlie Roberts (ST/RW) - ARCHIVED
            new Player
            {
                Id = CharlieRoberts_Id,
                ClubId = clubId,
                FirstName = "Charlie",
                LastName = "Roberts",
                Nickname = null,
                DateOfBirth = new DateOnly(2014, 11, 3),
                Photo = null,
                AssociationId = null,
                PreferredPositions = "[\"ST\",\"RW\"]",
                OverallRating = 59,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = true,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // William Brown (CM/CDM)
            new Player
            {
                Id = WilliamBrown_Id,
                ClubId = clubId,
                FirstName = "William",
                LastName = "Brown",
                Nickname = null,
                DateOfBirth = new DateOnly(2014, 4, 12),
                Photo = null,
                AssociationId = null,
                PreferredPositions = "[\"CM\",\"CDM\"]",
                OverallRating = 59,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // Harry Taylor (CB/CDM) - ARCHIVED
            new Player
            {
                Id = HarryTaylor_Id,
                ClubId = clubId,
                FirstName = "Harry",
                LastName = "Taylor",
                Nickname = null,
                DateOfBirth = new DateOnly(2014, 8, 7),
                Photo = null,
                AssociationId = null,
                PreferredPositions = "[\"CB\",\"CDM\"]",
                OverallRating = 53,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = true,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // Mason Evans (RW/LW)
            new Player
            {
                Id = MasonEvans_Id,
                ClubId = clubId,
                FirstName = "Mason",
                LastName = "Evans",
                Nickname = null,
                DateOfBirth = new DateOnly(2014, 2, 20),
                Photo = "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason",
                AssociationId = "SFA-Y-40278",
                PreferredPositions = "[\"RW\",\"LW\"]",
                OverallRating = 59,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // Alexander White (CAM/CM)
            new Player
            {
                Id = AlexanderWhite_Id,
                ClubId = clubId,
                FirstName = "Alexander",
                LastName = "White",
                Nickname = null,
                DateOfBirth = new DateOnly(2014, 6, 14),
                Photo = null,
                AssociationId = null,
                PreferredPositions = "[\"CAM\",\"CM\"]",
                OverallRating = 61,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // George Harris (LB/CB)
            new Player
            {
                Id = GeorgeHarris_Id,
                ClubId = clubId,
                FirstName = "George",
                LastName = "Harris",
                Nickname = null,
                DateOfBirth = new DateOnly(2014, 10, 28),
                Photo = "https://api.dicebear.com/7.x/avataaars/svg?seed=George",
                AssociationId = "SFA-Y-40312",
                PreferredPositions = "[\"LB\",\"CB\"]",
                OverallRating = 52,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            },

            // Carlos Rodriguez - El Matador (ST/CF) - 2012 Age Group
            new Player
            {
                Id = CarlosRodriguez_Id,
                ClubId = clubId,
                FirstName = "Carlos",
                LastName = "Rodriguez",
                Nickname = "El Matador",
                DateOfBirth = new DateOnly(2012, 4, 15),
                Photo = null,
                AssociationId = "SFA-Y-38456",
                PreferredPositions = "[\"ST\",\"CF\"]",
                OverallRating = 70,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddMonths(-1)
            }
        };
    }
}
