#nullable disable
using System;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

/// <summary>
/// Numeric score floor per band. Default 18/35/52/70 (Development/Intermediate/Advanced/Elite).
/// </summary>
public partial class CompetencyFrameworkBandThreshold
{
    public Guid Id { get; set; }

    public Guid FrameworkId { get; set; }

    public CompetencyBand Band { get; set; }

    public decimal Threshold { get; set; }

    public virtual CompetencyFramework Framework { get; set; }
}
