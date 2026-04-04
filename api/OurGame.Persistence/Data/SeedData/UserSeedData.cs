using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.SeedData;

public static class UserSeedData
{
    // Stable seeded user - DO NOT REMOVE
    public static readonly Guid MichaelLaw_Id = Guid.Parse("00000001-0000-0000-0000-000000000102");
    private const string TestUserNormalizedName = "michael law";

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

    public static string NormalizeEmail(string? value)
    {
        return (value ?? string.Empty).Trim().ToLowerInvariant();
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

    public static Guid GetUserIdByName(string name)
    {
        // Map "Michael Law" from JSON data to the hardcoded test user
        if (NormalizeName(name) == TestUserNormalizedName)
        {
            return MichaelLaw_Id;
        }

        return CreateDeterministicGuid($"user|{NormalizeName(name)}");
    }

    public static Guid GetAdminUserId(string adminName)
    {
        return GetUserIdByName(adminName);
    }

    public static Guid GetGuardianUserId(string guardianName)
    {
        return GetUserIdByName(guardianName);
    }

    public static string GetSafeUserEmail(string name, string? email, string? phone, string scope)
    {
        var normalizedEmail = NormalizeEmail(email);
        if (!string.IsNullOrWhiteSpace(normalizedEmail))
        {
            return normalizedEmail;
        }

        var slug = SlugifyName(name);
        var hash = Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes($"{NormalizeName(name)}|{NormalizePhone(phone)}|{scope}"))).ToLowerInvariant();
        return $"{scope}.{slug}.{hash[..12]}@seed.ourgame.local";
    }

    public static string GetSafeAdminEmail(string name, string? email, string? phone)
    {
        return GetSafeUserEmail(name, email, phone, "admin");
    }

    public static List<User> GetUsers()
    {
        var now = DateTime.UtcNow;
        var users = new List<User>
        {
            // Stable seeded user with a fixed auth identity for local development flows
            new User
            {
                Id = MichaelLaw_Id,
                AuthId = "a65e474c-6215-423c-8227-d3a44c6961c0",
                Email = "michael.law@valefc.com",
                FirstName = "Michael",
                LastName = "Law",
                Photo = null,
                Preferences = "{\"notifications\":true,\"theme\":\"dark\",\"navigationStyle\":\"modern\"}",
                IsAdmin = true,
                CreatedAt = now,
                UpdatedAt = now
            }
        };

        var mergedProfilesByName = BuildMergedProfilesByName();
        var usedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "michael.law@valefc.com" };

        foreach (var profile in mergedProfilesByName.Values.OrderBy(profile => profile.Name, StringComparer.OrdinalIgnoreCase))
        {
            // Skip "Michael Law" - already added as the hardcoded test user above
            if (NormalizeName(profile.Name) == TestUserNormalizedName)
            {
                continue;
            }

            var userId = GetUserIdByName(profile.Name);
            var (firstName, lastName) = SplitName(profile.Name);

            var email = GetSafeUserEmail(profile.Name, profile.Email, profile.Phone, profile.Scope);

            // If email already used by another user, generate a unique fallback
            if (!usedEmails.Add(email))
            {
                email = GetSafeUserEmail(profile.Name, null, profile.Phone, profile.Scope);

                // In the unlikely event the fallback also collides, add a suffix
                if (!usedEmails.Add(email))
                {
                    email = $"{userId:N}@seed.ourgame.local";
                    usedEmails.Add(email);
                }
            }

            users.Add(new User
            {
                Id = userId,
                AuthId = $"seed-{userId:N}",
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                Photo = null,
                Preferences = "{}",
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        return users;
    }

    private static Dictionary<string, ContactProfile> BuildMergedProfilesByName()
    {
        var profilesByName = new Dictionary<string, ContactProfile>(StringComparer.Ordinal);

        foreach (var guardian in GetDataset().Guardians)
        {
            UpsertProfile(profilesByName, guardian.Name, guardian.Email, guardian.Phone, "guardian");
        }

        foreach (var admin in GetDataset().Admins)
        {
            UpsertProfile(profilesByName, admin.Name, admin.Email, admin.Phone, "admin");
        }

        return profilesByName;
    }

    private static void UpsertProfile(Dictionary<string, ContactProfile> profilesByName, string name, string? email, string? phone, string scope)
    {
        var key = NormalizeName(name);

        if (!profilesByName.TryGetValue(key, out var existing))
        {
            profilesByName[key] = new ContactProfile(name, NormalizeEmail(email), NormalizePhone(phone), scope);
            return;
        }

        var mergedEmail = string.IsNullOrWhiteSpace(existing.Email) ? NormalizeEmail(email) : existing.Email;
        var mergedPhone = string.IsNullOrWhiteSpace(existing.Phone) ? NormalizePhone(phone) : existing.Phone;
        var mergedScope = existing.Scope == "admin" || scope == "admin" ? "admin" : "guardian";

        profilesByName[key] = existing with
        {
            Email = mergedEmail,
            Phone = mergedPhone,
            Scope = mergedScope
        };
    }

    private static (string FirstName, string LastName) SplitName(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length == 0)
        {
            return ("Unknown", "User");
        }

        if (parts.Length == 1)
        {
            return (parts[0], "User");
        }

        return (parts[0], string.Join(' ', parts.Skip(1)));
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

    private sealed record ContactProfile(string Name, string? Email, string? Phone, string Scope);

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
