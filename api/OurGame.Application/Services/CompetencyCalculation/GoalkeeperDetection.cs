namespace OurGame.Application.Services.CompetencyCalculation;

/// <summary>
/// Decides whether a player is scored as a goalkeeper: their primary (first) preferred
/// position is GK. PreferredPositions is stored as a JSON array string (e.g. ["GK","CB"]),
/// with a legacy delimited-string fallback.
/// </summary>
public static class GoalkeeperDetection
{
    public static bool IsGoalkeeper(string? preferredPositions)
    {
        if (string.IsNullOrWhiteSpace(preferredPositions))
            return false;

        string? first;
        try
        {
            var parsed = System.Text.Json.JsonSerializer.Deserialize<List<string>>(preferredPositions);
            first = parsed?.FirstOrDefault(p => !string.IsNullOrWhiteSpace(p));
        }
        catch (System.Text.Json.JsonException)
        {
            first = preferredPositions
                .Split(new[] { ',', '|', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim())
                .FirstOrDefault(p => !string.IsNullOrWhiteSpace(p));
        }

        return string.Equals(first, "GK", StringComparison.OrdinalIgnoreCase);
    }
}
