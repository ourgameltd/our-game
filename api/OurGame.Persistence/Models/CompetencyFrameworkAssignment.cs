#nullable disable
using System;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

/// <summary>
/// Assignment of a framework to a Club, AgeGroup, or Team. Resolution at calc time
/// is team -> age-group -> club. Exactly one of the three owner IDs is set.
/// </summary>
public partial class CompetencyFrameworkAssignment
{
    public Guid Id { get; set; }

    public Guid FrameworkId { get; set; }

    public CompetencyFrameworkScope Scope { get; set; }

    public Guid? ClubId { get; set; }

    public Guid? AgeGroupId { get; set; }

    public Guid? TeamId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual CompetencyFramework Framework { get; set; }

    public virtual Club Club { get; set; }

    public virtual AgeGroup AgeGroup { get; set; }

    public virtual Team Team { get; set; }
}
