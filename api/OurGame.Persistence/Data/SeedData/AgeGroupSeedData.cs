using System.Text.Json;
using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class AgeGroupSeedData
{
    // Age Group IDs from TypeScript data
    public static readonly Guid AgeGroup2014_Id = Guid.Parse("1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d");

    public static List<AgeGroup> GetAgeGroups()
    {
        var now = DateTime.UtcNow;
        
        return new List<AgeGroup>
        {
            new AgeGroup
            {
                Id = AgeGroup2014_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                Name = "2014s",
                Code = "2014",
                Level = Level.Youth,
                CurrentSeason = "2024/25",
                Seasons = JsonSerializer.Serialize(new[] { "2024/25", "2023/24" }),
                DefaultSeason = "2024/25",
                DefaultSquadSize = SquadSize.SevenASide,
                Description = "Under-11 age group for players born in 2014",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}
