using System.Text.Json;

namespace OurGame.Application.Extensions;

/// <summary>
/// Extension methods for Age Group season serialization/deserialization
/// </summary>
public static class AgeGroupSeasonX
{
    /// <summary>
    /// Parse seasons from string (supports both JSON array and CSV formats)
    /// </summary>
    /// <param name="seasonsString">Seasons string from database (JSON array or CSV)</param>
    /// <returns>List of season strings</returns>
    public static List<string> ParseSeasons(string? seasonsString)
    {
        if (string.IsNullOrWhiteSpace(seasonsString))
        {
            return new List<string>();
        }

        var trimmed = seasonsString.Trim();

        // Check if it's a JSON array format
        if (trimmed.StartsWith("["))
        {
            try
            {
                var seasons = JsonSerializer.Deserialize<List<string>>(trimmed);
                if (seasons != null)
                {
                    return seasons
                        .Select(s => s.Trim().Trim('"'))
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .ToList();
                }
            }
            catch (JsonException)
            {
                // Fall back to CSV parsing if JSON deserialization fails
            }
        }

        // CSV format or JSON parse failed - split by comma
        return trimmed
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim().Trim('"').Trim('[').Trim(']'))
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .ToList();
    }

    /// <summary>
    /// Serialize seasons to JSON array format for storage
    /// </summary>
    /// <param name="seasons">Collection of season strings</param>
    /// <returns>JSON array string</returns>
    public static string SerializeSeasons(IEnumerable<string> seasons)
    {
        var seasonList = seasons?.ToList() ?? new List<string>();
        return JsonSerializer.Serialize(seasonList);
    }
}
