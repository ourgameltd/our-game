#nullable disable
using System;

namespace OurGame.Persistence.Models;

/// <summary>
/// Club-level toggle controlling whether age groups can override the club framework.
/// </summary>
public partial class ClubCompetencySettings
{
    public Guid Id { get; set; }

    public Guid ClubId { get; set; }

    public bool AllowAgeGroupOverride { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Club Club { get; set; }
}
