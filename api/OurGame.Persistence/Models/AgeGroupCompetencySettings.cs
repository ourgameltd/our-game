#nullable disable
using System;

namespace OurGame.Persistence.Models;

/// <summary>
/// Age-group-level toggle controlling whether teams can override the age-group framework.
/// Only meaningful when the parent club's AllowAgeGroupOverride is true.
/// </summary>
public partial class AgeGroupCompetencySettings
{
    public Guid Id { get; set; }

    public Guid AgeGroupId { get; set; }

    public bool AllowTeamOverride { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual AgeGroup AgeGroup { get; set; }
}
