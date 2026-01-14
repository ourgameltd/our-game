using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class AgeGroupSeedData
{
    // Age Group IDs from TypeScript data
    public static readonly Guid AgeGroup2014_Id = Guid.Parse("1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d");
    public static readonly Guid AgeGroup2013_Id = Guid.Parse("2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e");
    public static readonly Guid AgeGroup2012_Id = Guid.Parse("3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f");
    public static readonly Guid AgeGroupAmateur_Id = Guid.Parse("4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a");
    public static readonly Guid AgeGroupReserves_Id = Guid.Parse("5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b");
    public static readonly Guid AgeGroupSenior_Id = Guid.Parse("6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c");
    public static readonly Guid AgeGroup2015_Id = Guid.Parse("7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d");

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
                Seasons = "[\"2024/25\",\"2023/24\"]",
                DefaultSeason = "2024/25",
                DefaultSquadSize = SquadSize.SevenASide,
                Description = "Under-11 age group for players born in 2014",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new AgeGroup
            {
                Id = AgeGroup2013_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                Name = "2013s",
                Code = "2013",
                Level = Level.Youth,
                CurrentSeason = "2024/25",
                Seasons = "[\"2024/25\"]",
                DefaultSeason = "2024/25",
                DefaultSquadSize = SquadSize.NineASide,
                Description = "Under-12 age group for players born in 2013",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new AgeGroup
            {
                Id = AgeGroup2012_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                Name = "2012s",
                Code = "2012",
                Level = Level.Youth,
                CurrentSeason = "2024/25",
                Seasons = "[\"2024/25\"]",
                DefaultSeason = "2024/25",
                DefaultSquadSize = SquadSize.ElevenASide,
                Description = "Under-13 age group for players born in 2012",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new AgeGroup
            {
                Id = AgeGroupAmateur_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                Name = "Amateur",
                Code = "AMATEUR",
                Level = Level.Amateur,
                CurrentSeason = "2024/25",
                Seasons = "[\"2024/25\"]",
                DefaultSeason = "2024/25",
                DefaultSquadSize = SquadSize.ElevenASide,
                Description = "Adult amateur teams for recreational players",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new AgeGroup
            {
                Id = AgeGroupReserves_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                Name = "Reserves",
                Code = "reserves",
                Level = Level.Senior,
                CurrentSeason = "2024/25",
                Seasons = "[\"2024/25\",\"2023/24\"]",
                DefaultSeason = "2024/25",
                DefaultSquadSize = SquadSize.ElevenASide,
                Description = "Reserve team competing in local leagues",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new AgeGroup
            {
                Id = AgeGroupSenior_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                Name = "Senior",
                Code = "senior",
                Level = Level.Senior,
                CurrentSeason = "2024/25",
                Seasons = "[\"2024/25\",\"2023/24\"]",
                DefaultSeason = "2024/25",
                DefaultSquadSize = SquadSize.ElevenASide,
                Description = "First team representing the club at the highest level",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new AgeGroup
            {
                Id = AgeGroup2015_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                Name = "2015s",
                Code = "2015",
                Level = Level.Youth,
                CurrentSeason = "2023/24",
                Seasons = "[\"2023/24\",\"2022/23\"]",
                DefaultSeason = "2023/24",
                DefaultSquadSize = SquadSize.SevenASide,
                Description = "Archived: Under-10 age group from previous season",
                IsArchived = true,
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}
