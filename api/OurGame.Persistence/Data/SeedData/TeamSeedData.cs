using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class TeamSeedData
{
    // Team IDs from TypeScript data
    public static readonly Guid Reds2014_Id = Guid.Parse("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d");
    public static readonly Guid Whites2014_Id = Guid.Parse("b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e");
    public static readonly Guid Blues2014_Id = Guid.Parse("c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f");
    public static readonly Guid Reds2013_Id = Guid.Parse("d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a");
    public static readonly Guid FirstTeam_Id = Guid.Parse("e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b");
    public static readonly Guid Greens2015_Id = Guid.Parse("f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c");

    public static List<Team> GetTeams()
    {
        var now = DateTime.UtcNow;
        
        return new List<Team>
        {
            new Team
            {
                Id = Reds2014_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id,
                Name = "Reds",
                ShortName = "RDS",
                Level = "youth",
                Season = "2024/25",
                FormationId = null,
                PrimaryColor = "#DC2626",
                SecondaryColor = "#FFFFFF",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Team
            {
                Id = Whites2014_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id,
                Name = "Whites",
                ShortName = "WTS",
                Level = "youth",
                Season = "2024/25",
                FormationId = null,
                PrimaryColor = "#F3F4F6",
                SecondaryColor = "#1F2937",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Team
            {
                Id = Blues2014_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id,
                Name = "Blues",
                ShortName = "BLS",
                Level = "youth",
                Season = "2024/25",
                FormationId = null,
                PrimaryColor = "#2563EB",
                SecondaryColor = "#FFFFFF",
                IsArchived = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Team
            {
                Id = Reds2013_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                AgeGroupId = AgeGroupSeedData.AgeGroup2013_Id,
                Name = "Reds",
                ShortName = "RDS",
                Level = "youth",
                Season = "2024/25",
                FormationId = null,
                PrimaryColor = "#DC2626",
                SecondaryColor = "#FFFFFF",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Team
            {
                Id = FirstTeam_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                AgeGroupId = AgeGroupSeedData.AgeGroupSenior_Id,
                Name = "First Team",
                ShortName = "FT",
                Level = "senior",
                Season = "2024/25",
                FormationId = null,
                PrimaryColor = "#1a472a",
                SecondaryColor = "#ffd700",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Team
            {
                Id = Greens2015_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                AgeGroupId = AgeGroupSeedData.AgeGroup2015_Id,
                Name = "Greens",
                ShortName = "GRN",
                Level = "youth",
                Season = "2023/24",
                FormationId = null,
                PrimaryColor = "#16A34A",
                SecondaryColor = "#FFFFFF",
                IsArchived = true,
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}
