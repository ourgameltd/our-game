#nullable disable
using System;
using System.Collections.Generic;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

/// <summary>
/// A tunable competency framework: per-format attribute weightings, band thresholds,
/// rubric descriptions, and uplift percent. Scoped to System (read-only seed), Club,
/// AgeGroup, or Team. Clubs can clone system frameworks via SourceFrameworkId.
/// </summary>
public partial class CompetencyFramework
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public bool IsSystemDefault { get; set; }

    public Guid? SourceFrameworkId { get; set; }

    public CompetencyFrameworkScope Scope { get; set; }

    public Guid? OwnerClubId { get; set; }

    public Guid? OwnerAgeGroupId { get; set; }

    public Guid? OwnerTeamId { get; set; }

    public decimal UpliftPercent { get; set; }

    public bool IsArchived { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual CompetencyFramework SourceFramework { get; set; }

    public virtual Club OwnerClub { get; set; }

    public virtual AgeGroup OwnerAgeGroup { get; set; }

    public virtual Team OwnerTeam { get; set; }

    public virtual ICollection<CompetencyFrameworkBandThreshold> BandThresholds { get; set; } = new List<CompetencyFrameworkBandThreshold>();

    public virtual ICollection<CompetencyFrameworkCompetencyDescription> CompetencyDescriptions { get; set; } = new List<CompetencyFrameworkCompetencyDescription>();

    public virtual ICollection<CompetencyFrameworkAttributeWeight> AttributeWeights { get; set; } = new List<CompetencyFrameworkAttributeWeight>();
}
