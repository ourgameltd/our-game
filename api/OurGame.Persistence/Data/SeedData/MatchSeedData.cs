using OurGame.Persistence.Models;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Data.SeedData;

public static class MatchSeedData
{
    // Match IDs from TypeScript data
    public static readonly Guid Match1_Id = Guid.Parse("a1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
    public static readonly Guid Match2_Id = Guid.Parse("a2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
    public static readonly Guid Match3_Id = Guid.Parse("a3c4d5e6-f7a8-b9c0-d1e2-f3a4b5c6d7e8");
    public static readonly Guid Match4_Id = Guid.Parse("a4d5e6f7-a8b9-c0d1-e2f3-a4b5c6d7e8f9");
    public static readonly Guid Match5_Id = Guid.Parse("a5e6f7a8-b9c0-d1e2-f3a4-b5c6d7e8f9a0");

    public static List<Match> GetMatches()
    {
        return new List<Match>
        {
            // Completed matches
            new Match
            {
                Id = Match1_Id,
                TeamId = TeamSeedData.Reds2014_Id,
                SquadSize = SquadSize.ElevenASide,
                Opposition = "Riverside United",
                MatchDate = new DateTime(2025, 12, 13, 15, 0, 0, DateTimeKind.Utc),
                KickOffTime = new DateTime(2025, 12, 13, 15, 0, 0, DateTimeKind.Utc),
                MeetTime = new DateTime(2025, 12, 13, 14, 15, 0, DateTimeKind.Utc),
                Location = "Community Sports Ground",
                IsHome = true,
                Competition = "County League Division 1",
                PrimaryKitId = KitSeedData.ValeHomeKit_Id,
                GoalkeeperKitId = KitSeedData.ValeGKKit_Id,
                Status = MatchStatus.Completed,
                HomeScore = 2,
                AwayScore = 1,
                WeatherCondition = "Partly Cloudy",
                WeatherTemperature = 12,
                IsLocked = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Match
            {
                Id = Match2_Id,
                TeamId = TeamSeedData.Whites2014_Id,
                SquadSize = SquadSize.NineASide,
                Opposition = "Hillside Youth",
                MatchDate = new DateTime(2025, 12, 14, 18, 30, 0, DateTimeKind.Utc),
                KickOffTime = new DateTime(2025, 12, 14, 18, 30, 0, DateTimeKind.Utc),
                MeetTime = new DateTime(2025, 12, 14, 17, 45, 0, DateTimeKind.Utc),
                Location = "Hillside Stadium",
                IsHome = false,
                Competition = "Youth Cup - Quarter Final",
                PrimaryKitId = KitSeedData.ValeAwayKit_Id,
                GoalkeeperKitId = KitSeedData.ValeGKKit_Id,
                Status = MatchStatus.Completed,
                HomeScore = 1,
                AwayScore = 3,
                IsLocked = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Match
            {
                Id = Match3_Id,
                TeamId = TeamSeedData.Reds2014_Id,
                SquadSize = SquadSize.ElevenASide,
                Opposition = "Parkside Rangers",
                MatchDate = new DateTime(2024, 12, 1, 15, 0, 0, DateTimeKind.Utc),
                KickOffTime = new DateTime(2024, 12, 1, 15, 0, 0, DateTimeKind.Utc),
                Location = "Community Sports Ground",
                IsHome = true,
                Competition = "County League Division 1",
                PrimaryKitId = KitSeedData.ValeHomeKit_Id,
                GoalkeeperKitId = KitSeedData.ValeGKKit_Id,
                Status = MatchStatus.Completed,
                HomeScore = 3,
                AwayScore = 1,
                WeatherCondition = "Clear",
                WeatherTemperature = 10,
                IsLocked = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Match
            {
                Id = Match4_Id,
                TeamId = TeamSeedData.Whites2014_Id,
                SquadSize = SquadSize.NineASide,
                Opposition = "Hillside Athletic",
                MatchDate = new DateTime(2024, 12, 1, 13, 0, 0, DateTimeKind.Utc),
                KickOffTime = new DateTime(2024, 12, 1, 13, 0, 0, DateTimeKind.Utc),
                Location = "Hillside Park",
                IsHome = false,
                Competition = "Youth League",
                Status = MatchStatus.Completed,
                HomeScore = 2,
                AwayScore = 2,
                IsLocked = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Match
            {
                Id = Match5_Id,
                TeamId = TeamSeedData.Reds2014_Id,
                SquadSize = SquadSize.ElevenASide,
                Opposition = "Meadow United",
                MatchDate = new DateTime(2024, 11, 24, 15, 0, 0, DateTimeKind.Utc),
                KickOffTime = new DateTime(2024, 11, 24, 15, 0, 0, DateTimeKind.Utc),
                Location = "Community Sports Ground",
                IsHome = true,
                Competition = "County League Division 1",
                Status = MatchStatus.Completed,
                HomeScore = 4,
                AwayScore = 0,
                IsLocked = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };
    }
}
