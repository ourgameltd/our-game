using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class UserSeedData
{
    // Stable seeded user - DO NOT REMOVE
    public static readonly Guid MichaelLaw_Id = Guid.Parse("00000001-0000-0000-0000-000000000102");

    private static readonly string DatasetPath = Path.Combine(
        AppContext.BaseDirectory,
        "Data",
        "SeedData",
        "vol-2014-members.json");

    private static readonly Lazy<VolDataset> Dataset = new(LoadDataset);

    public static VolDataset GetDataset()
    {
        return Dataset.Value;
    }

    public static Guid CreateDeterministicGuid(string input)
    {
        var normalized = (input ?? string.Empty).Trim().ToLowerInvariant();
        var hash = MD5.HashData(Encoding.UTF8.GetBytes(normalized));
        return new Guid(hash);
    }

    public static string NormalizeName(string? value)
    {
        return (value ?? string.Empty)
            .Replace("\u2018", "'")
            .Replace("\u2019", "'")
            .Replace("\u201B", "'")
            .Replace("\u2032", "'")
            .Replace("\u201C", "\"")
            .Replace("\u201D", "\"")
            .Trim()
            .ToLowerInvariant();
    }

    public static string NormalizePhone(string? value)
    {
        return (value ?? string.Empty).Trim().ToLowerInvariant();
    }

    public static string GetSafeCoachAssociationId(string name, string? associationId = null)
    {
        var normalizedAssociationId = (associationId ?? string.Empty).Trim();
        if (!string.IsNullOrWhiteSpace(normalizedAssociationId))
        {
            return normalizedAssociationId;
        }

        return $"seed-assoc-{SlugifyName(name)}";
    }

    public static List<User> GetUsers()
    {
        var now = DateTime.UtcNow;

        // Only seed the single admin user – all other users are created via B2C registration
        return new List<User>
        {
            new User
            {
                Id = MichaelLaw_Id,
                AuthId = "4b2476a-21f8-4b25-9a2f-a7914b0b9f08",
                Email = "michael@michaellaw.me",
                FirstName = "Michael",
                LastName = "Law",
                Photo = null,
                Preferences = "{\"notifications\":true,\"theme\":\"dark\",\"navigationStyle\":\"modern\"}",
                IsAdmin = true,
                CreatedAt = now,
                UpdatedAt = now
            }
        };
    }

    private static string SlugifyName(string name)
    {
        var normalizedName = NormalizeName(name);
        var sb = new StringBuilder(normalizedName.Length);

        foreach (var ch in normalizedName)
        {
            sb.Append(char.IsLetterOrDigit(ch) ? ch : '-');
        }

        var slug = sb.ToString().Trim('-');
        while (slug.Contains("--", StringComparison.Ordinal))
        {
            slug = slug.Replace("--", "-", StringComparison.Ordinal);
        }

        return string.IsNullOrWhiteSpace(slug) ? "user" : slug;
    }

    private static VolDataset LoadDataset()
    {
        if (!File.Exists(DatasetPath))
        {
            throw new FileNotFoundException($"Seed dataset file not found at '{DatasetPath}'.");
        }

        var json = File.ReadAllText(DatasetPath);
        var raw = JsonSerializer.Deserialize<RawVolDataset>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (raw is null)
        {
            throw new InvalidOperationException("Failed to deserialize seed dataset JSON.");
        }

        var players = raw.Players
            .Where(player => !string.IsNullOrWhiteSpace(player.Name) && !string.IsNullOrWhiteSpace(player.Team))
            .Select(player => new PlayerSource(
                Name: NormalizeRawValue(player.Name),
                Team: NormalizeRawValue(player.Team),
                Dob: NormalizeOptionalRawValue(player.Dob),
                Syfa: NormalizeOptionalRawValue(player.Syfa)))
            .ToList();

        var guardians = raw.Guardians
            .Where(guardian => !string.IsNullOrWhiteSpace(guardian.Player) && !string.IsNullOrWhiteSpace(guardian.Name))
            .Select(guardian => new GuardianSource(
                Player: NormalizeRawValue(guardian.Player),
                Name: NormalizeRawValue(guardian.Name),
                Email: NormalizeOptionalRawValue(guardian.Email),
                Phone: NormalizeOptionalRawValue(guardian.Phone)))
            .ToList();

        var admins = raw.Admins
            .Where(admin => !string.IsNullOrWhiteSpace(admin.Team) && !string.IsNullOrWhiteSpace(admin.Name))
            .Select(admin => new AdminSource(
                Team: NormalizeRawValue(admin.Team),
                Name: NormalizeRawValue(admin.Name),
                Email: NormalizeOptionalRawValue(admin.Email),
                Phone: NormalizeOptionalRawValue(admin.Phone),
                AssociationId: NormalizeOptionalRawValue(admin.AssociationId)))
            .ToList();

        return new VolDataset(players, guardians, admins);
    }

    private static string NormalizeRawValue(string value)
    {
        return value
            .Replace("\u2018", "'")
            .Replace("\u2019", "'")
            .Replace("\u201B", "'")
            .Replace("\u2032", "'")
            .Replace("\u201C", "\"")
            .Replace("\u201D", "\"")
            .Trim();
    }

    private static string? NormalizeOptionalRawValue(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return NormalizeRawValue(value);
    }

    private sealed class RawVolDataset
    {
        public List<RawPlayer> Players { get; set; } = new();

        public List<RawGuardian> Guardians { get; set; } = new();

        public List<RawAdmin> Admins { get; set; } = new();
    }

    private sealed class RawPlayer
    {
        public string Name { get; set; } = string.Empty;

        public string Team { get; set; } = string.Empty;

        public string? Dob { get; set; }

        public string? Syfa { get; set; }
    }

    private sealed class RawGuardian
    {
        public string Player { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string? Email { get; set; }

        public string? Phone { get; set; }
    }

    private sealed class RawAdmin
    {
        public string Team { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? AssociationId { get; set; }
    }

    public sealed record VolDataset(IReadOnlyList<PlayerSource> Players, IReadOnlyList<GuardianSource> Guardians, IReadOnlyList<AdminSource> Admins);

    public sealed record PlayerSource(string Name, string Team, string? Dob, string? Syfa);

    public sealed record GuardianSource(string Player, string Name, string? Email, string? Phone);

    public sealed record AdminSource(string Team, string Name, string? Email, string? Phone, string? AssociationId);
}
