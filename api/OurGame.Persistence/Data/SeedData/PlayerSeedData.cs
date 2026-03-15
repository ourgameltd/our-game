using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class PlayerSeedData
{
    public static IReadOnlyList<UserSeedData.PlayerSource> GetSourcePlayers()
    {
        return UserSeedData.GetDataset().Players;
    }

    public static Guid GetPlayerIdByName(string playerName)
    {
        return UserSeedData.CreateDeterministicGuid($"player|{UserSeedData.NormalizeName(playerName)}");
    }

    public static string GetTeamNameForPlayer(string playerName)
    {
        var normalizedPlayerName = UserSeedData.NormalizeName(playerName);
        var source = GetSourcePlayers().FirstOrDefault(player => UserSeedData.NormalizeName(player.Name) == normalizedPlayerName);

        if (source is null)
        {
            throw new InvalidOperationException($"Unknown player name '{playerName}'.");
        }

        return source.Team;
    }

    public static List<Player> GetPlayers()
    {
        var now = DateTime.UtcNow;

        return GetSourcePlayers().Select(source =>
        {
            var (firstName, lastName) = SplitName(source.Name);

            return new Player
            {
                Id = GetPlayerIdByName(source.Name),
                ClubId = ClubSeedData.ValeFC_Id,
                FirstName = firstName,
                LastName = lastName,
                Nickname = null,
                DateOfBirth = ParseDate(source.Dob),
                Photo = null,
                AssociationId = source.Syfa,
                PreferredPositions = "[\"CM\"]",
                OverallRating = 55,
                UserId = null,
                Allergies = null,
                MedicalConditions = null,
                IsArchived = false,
                CreatedAt = now,
                UpdatedAt = now
            };
        }).ToList();
    }

    private static DateOnly? ParseDate(string? rawDate)
    {
        if (DateOnly.TryParse(rawDate, out var dateOfBirth))
        {
            return dateOfBirth;
        }

        return null;
    }

    private static (string FirstName, string LastName) SplitName(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length == 0)
        {
            return ("Unknown", "Player");
        }

        if (parts.Length == 1)
        {
            return (parts[0], "Player");
        }

        return (parts[0], string.Join(' ', parts.Skip(1)));
    }
}
