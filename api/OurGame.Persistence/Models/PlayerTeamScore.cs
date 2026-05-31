#nullable disable
using System;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

/// <summary>
/// Derived per-team score for a player, recomputed whenever competency levels,
/// the resolved framework, or the team format change.
/// </summary>
public partial class PlayerTeamScore
{
    public Guid Id { get; set; }

    public Guid PlayerId { get; set; }

    public Guid TeamId { get; set; }

    public Guid FrameworkId { get; set; }

    public GameFormat Format { get; set; }

    public decimal BaseScore { get; set; }

    public decimal BoostedScore { get; set; }

    public CompetencyBand Band { get; set; }

    public string DerivedAttributesJson { get; set; }

    public DateTime CalculatedAt { get; set; }

    public virtual Player Player { get; set; }

    public virtual Team Team { get; set; }

    public virtual CompetencyFramework Framework { get; set; }
}
