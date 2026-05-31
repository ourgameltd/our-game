using OurGame.Persistence.Enums;

namespace OurGame.Application.Services.CompetencyCalculation;

/// <summary>
/// Orchestrates competency-based score calculation against the database. Combines a
/// pure scoring core (<see cref="CompetencyScoreCalculator"/>) with persistence-aware
/// resolution and write-back of derived rows.
/// </summary>
public interface ICompetencyCalculationService
{
    /// <summary>
    /// Resolves the framework that applies to a given team using the
    /// team -> age-group -> club assignment fallback. Returns null if no framework
    /// is assigned anywhere in the chain.
    /// </summary>
    Task<CompetencyFrameworkSnapshot?> ResolveFrameworkForTeamAsync(Guid teamId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Loads a framework into its calculation-ready snapshot form.
    /// </summary>
    Task<CompetencyFrameworkSnapshot?> LoadFrameworkAsync(Guid frameworkId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Recalculates per-team scores for one player across every team they belong to,
    /// rewrites Player.OverallRating/OverallBand from the primary team's boosted score,
    /// and refreshes the PlayerAttribute derived cache from the primary team result.
    /// Safe to call after a competency band change, team-format change, framework swap,
    /// or framework-weight edit.
    /// </summary>
    Task RecalculatePlayerScoresAsync(Guid playerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Recalculates every player belonging to the supplied team.
    /// </summary>
    Task RecalculateTeamAsync(Guid teamId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Recalculates every player belonging to any team in the age group.
    /// </summary>
    Task RecalculateAgeGroupAsync(Guid ageGroupId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Recalculates every player in the club.
    /// </summary>
    Task RecalculateClubAsync(Guid clubId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Convenience: compute a score without persisting anything. Used by preview endpoints
    /// and the modal's live footer.
    /// </summary>
    CompetencyScoreResult Preview(
        IReadOnlyDictionary<Guid, CompetencyBand> competencyLevels,
        CompetencyFrameworkSnapshot framework,
        GameFormat format);
}
