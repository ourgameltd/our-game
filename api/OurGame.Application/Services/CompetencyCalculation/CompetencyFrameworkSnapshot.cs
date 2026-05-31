using OurGame.Persistence.Enums;

namespace OurGame.Application.Services.CompetencyCalculation;

/// <summary>
/// Immutable in-memory snapshot of a framework, sized for fast repeated calculation
/// without re-fetching child tables. Built once, scored against many times.
/// </summary>
public sealed class CompetencyFrameworkSnapshot
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal UpliftPercent { get; init; }
    public IReadOnlyDictionary<CompetencyBand, decimal> BandThresholds { get; init; } = new Dictionary<CompetencyBand, decimal>();
    public IReadOnlyDictionary<(Guid AttributeId, GameFormat Format), int> AttributeWeights { get; init; } = new Dictionary<(Guid, GameFormat), int>();
}

/// <summary>
/// Result of scoring one player against one framework in one format.
/// </summary>
public sealed class CompetencyScoreResult
{
    public decimal BaseScore { get; init; }
    public decimal BoostedScore { get; init; }
    public CompetencyBand Band { get; init; }

    /// <summary>
    /// Per-attribute derived value on the legacy 0-99 display scale, keyed by attribute id.
    /// </summary>
    public IReadOnlyDictionary<Guid, int> DerivedAttributeValues { get; init; } = new Dictionary<Guid, int>();
}
