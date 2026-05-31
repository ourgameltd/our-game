#nullable disable
using System;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

/// <summary>
/// Per-format weight for one attribute in a framework. 35 attributes x 4 formats = 140 rows per framework.
/// Weights are integer percent (0-100); each format's grand total must equal 100.
/// </summary>
public partial class CompetencyFrameworkAttributeWeight
{
    public Guid Id { get; set; }

    public Guid FrameworkId { get; set; }

    public Guid AttributeId { get; set; }

    public GameFormat Format { get; set; }

    public int WeightPercent { get; set; }

    public virtual CompetencyFramework Framework { get; set; }

    public virtual CompetencyAttribute Attribute { get; set; }
}
