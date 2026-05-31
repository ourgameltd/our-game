using OurGame.Persistence.Enums;

namespace OurGame.Application.Services.CompetencyCalculation;

/// <summary>
/// Pure-function scoring core. No DB access, no DI — trivially unit testable.
/// Implements the model described in docs/competency-framework-overview.md
/// with a configurable uplift (default 5%) and configurable band thresholds.
/// </summary>
public static class CompetencyScoreCalculator
{
    /// <summary>
    /// Range used to map a competency-band numeric score (typically 18..70) onto
    /// the legacy 0-99 display scale used by the existing PlayerAttributes UI.
    /// </summary>
    private const decimal DisplayScaleMin = 18m;
    private const decimal DisplayScaleMax = 70m;

    public static CompetencyScoreResult Calculate(
        IReadOnlyDictionary<Guid, CompetencyBand> competencyLevelsByCompetencyId,
        IReadOnlyList<AttributeCompetencyMapping> attributeMappings,
        CompetencyFrameworkSnapshot framework,
        GameFormat format)
    {
        if (framework is null) throw new ArgumentNullException(nameof(framework));
        if (attributeMappings is null) throw new ArgumentNullException(nameof(attributeMappings));
        if (competencyLevelsByCompetencyId is null) throw new ArgumentNullException(nameof(competencyLevelsByCompetencyId));

        var bandToScore = framework.BandThresholds;
        var derived = new Dictionary<Guid, int>(attributeMappings.Count);
        decimal baseScore = 0m;

        foreach (var attr in attributeMappings)
        {
            if (!competencyLevelsByCompetencyId.TryGetValue(attr.CompetencyId, out var band))
            {
                // Missing band defaults to Development so a brand-new player still scores.
                band = CompetencyBand.Development;
            }

            if (!bandToScore.TryGetValue(band, out var competencyScore))
            {
                competencyScore = DefaultBandScore(band);
            }

            framework.AttributeWeights.TryGetValue((attr.AttributeId, format), out var weightPercent);
            var weightFactor = weightPercent / 100m;

            baseScore += competencyScore * weightFactor;
            derived[attr.AttributeId] = MapToDisplayScale(competencyScore);
        }

        var boosted = baseScore * (1m + framework.UpliftPercent / 100m);
        var band99 = ResolveBand(boosted, bandToScore);

        return new CompetencyScoreResult
        {
            BaseScore = decimal.Round(baseScore, 2, MidpointRounding.AwayFromZero),
            BoostedScore = decimal.Round(boosted, 2, MidpointRounding.AwayFromZero),
            Band = band99,
            DerivedAttributeValues = derived,
        };
    }

    private static int MapToDisplayScale(decimal competencyScore)
    {
        var clamped = Math.Clamp(competencyScore, DisplayScaleMin, DisplayScaleMax);
        var normalised = (clamped - DisplayScaleMin) / (DisplayScaleMax - DisplayScaleMin);
        var scaled = normalised * 99m;
        return (int)decimal.Round(scaled, 0, MidpointRounding.AwayFromZero);
    }

    private static CompetencyBand ResolveBand(decimal boostedScore, IReadOnlyDictionary<CompetencyBand, decimal> thresholds)
    {
        // Approximate XLOOKUP: highest band whose threshold is <= boosted score.
        var ordered = thresholds
            .OrderByDescending(kv => kv.Value)
            .ToList();

        foreach (var kv in ordered)
        {
            if (boostedScore >= kv.Value) return kv.Key;
        }

        return CompetencyBand.Development;
    }

    private static decimal DefaultBandScore(CompetencyBand band) => band switch
    {
        CompetencyBand.Development => 18m,
        CompetencyBand.Intermediate => 35m,
        CompetencyBand.Advanced => 52m,
        CompetencyBand.Elite => 70m,
        _ => 18m,
    };
}

/// <summary>
/// Lightweight (attribute, competency) tuple consumed by the pure scoring function.
/// </summary>
public readonly record struct AttributeCompetencyMapping(Guid AttributeId, Guid CompetencyId);
