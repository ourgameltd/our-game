using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class TeamSeedData
{
    public static readonly Guid Black2014_Id = UserSeedData.CreateDeterministicGuid("team|vale-fc|2014|black");
    public static readonly Guid Blue2014_Id = UserSeedData.CreateDeterministicGuid("team|vale-fc|2014|blue");
    public static readonly Guid Girls2014_Id = UserSeedData.CreateDeterministicGuid("team|vale-fc|2014|girls");
    public static readonly Guid White2014_Id = UserSeedData.CreateDeterministicGuid("team|vale-fc|2014|white");

    // Backward-compatible aliases for existing references.
    public static readonly Guid Blues2014_Id = Blue2014_Id;
    public static readonly Guid Whites2014_Id = White2014_Id;

    private static readonly Dictionary<string, Guid> TeamIdByName = new(StringComparer.Ordinal)
    {
        [NormalizeTeamName("Black")] = Black2014_Id,
        [NormalizeTeamName("Blue")] = Blue2014_Id,
        [NormalizeTeamName("Girls")] = Girls2014_Id,
        [NormalizeTeamName("White")] = White2014_Id
    };

    public static Guid GetTeamIdByName(string teamName)
    {
        var key = NormalizeTeamName(teamName);
        if (TeamIdByName.TryGetValue(key, out var teamId))
        {
            return teamId;
        }

        throw new InvalidOperationException($"Unknown team name '{teamName}'.");
    }

    public static string NormalizeTeamName(string? teamName)
    {
        return (teamName ?? string.Empty).Trim().ToLowerInvariant();
    }

    public static List<Team> GetTeams()
    {
        var now = DateTime.UtcNow;

        return new List<Team>
        {
            new Team
            {
                Id = Black2014_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id,
                Name = "Black",
                ShortName = "BLK",
                Level = "youth",
                Season = "2024/25",
                FormationId = null,
                PrimaryColor = "#111827",
                SecondaryColor = "#FFFFFF",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Team
            {
                Id = Blue2014_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id,
                Name = "Blue",
                ShortName = "BLU",
                Level = "youth",
                Season = "2024/25",
                FormationId = null,
                PrimaryColor = "#2563EB",
                SecondaryColor = "#FFFFFF",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Team
            {
                Id = Girls2014_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id,
                Name = "Girls",
                ShortName = "GRL",
                Level = "youth",
                Season = "2024/25",
                FormationId = null,
                PrimaryColor = "#EC4899",
                SecondaryColor = "#FFFFFF",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Team
            {
                Id = White2014_Id,
                ClubId = ClubSeedData.ValeFC_Id,
                AgeGroupId = AgeGroupSeedData.AgeGroup2014_Id,
                Name = "White",
                ShortName = "WHT",
                Level = "youth",
                Season = "2024/25",
                FormationId = null,
                PrimaryColor = "#F3F4F6",
                SecondaryColor = "#1F2937",
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }
}
