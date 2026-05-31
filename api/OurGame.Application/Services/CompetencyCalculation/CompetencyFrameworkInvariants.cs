using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Services.CompetencyCalculation;

/// <summary>
/// Validation invariants for a competency framework. Called by both handlers
/// (request validation) and seed-time assertions (catches malformed default data
/// before it ships).
/// </summary>
public static class CompetencyFrameworkInvariants
{
    /// <summary>
    /// Ensures band thresholds are strictly ascending Development &lt; Intermediate &lt; Advanced &lt; Elite.
    /// </summary>
    public static void EnsureThresholdsAscending(IReadOnlyDictionary<CompetencyBand, decimal> thresholds)
    {
        var order = new[] { CompetencyBand.Development, CompetencyBand.Intermediate, CompetencyBand.Advanced, CompetencyBand.Elite };
        decimal? previous = null;
        foreach (var band in order)
        {
            if (!thresholds.TryGetValue(band, out var value))
            {
                throw new ValidationException("BandThresholds", $"Threshold for band {band} is missing.");
            }
            if (previous is not null && value <= previous)
            {
                throw new ValidationException("BandThresholds", $"Thresholds must be strictly ascending; {band} ({value}) is not greater than the previous band ({previous}).");
            }
            previous = value;
        }
    }

    /// <summary>
    /// Ensures the supplied per-format weights sum to exactly 100 for every game format.
    /// </summary>
    public static void EnsureFormatTotalsAre100(IEnumerable<(GameFormat Format, int WeightPercent)> weights)
    {
        var formats = new[] { GameFormat.FiveASide, GameFormat.SevenASide, GameFormat.NineASide, GameFormat.ElevenASide };
        var grouped = weights.GroupBy(w => w.Format).ToDictionary(g => g.Key, g => g.Sum(w => w.WeightPercent));
        foreach (var f in formats)
        {
            grouped.TryGetValue(f, out var total);
            if (total != 100)
            {
                throw new ValidationException("Weights", $"Game format {f} weights total {total}, must equal 100.");
            }
        }
    }
}
