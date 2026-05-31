#nullable disable
using System;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

/// <summary>
/// Editable rubric text for one competency at one band, per framework. 9 competencies x 4 bands = 36 rows per framework.
/// </summary>
public partial class CompetencyFrameworkCompetencyDescription
{
    public Guid Id { get; set; }

    public Guid FrameworkId { get; set; }

    public Guid CompetencyId { get; set; }

    public CompetencyBand Band { get; set; }

    public string Description { get; set; }

    public virtual CompetencyFramework Framework { get; set; }

    public virtual Competency Competency { get; set; }
}
