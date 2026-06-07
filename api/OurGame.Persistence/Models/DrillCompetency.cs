#nullable disable
using System;

namespace OurGame.Persistence.Models;

public partial class DrillCompetency
{
    public Guid Id { get; set; }

    public Guid DrillId { get; set; }

    public Guid CompetencyId { get; set; }

    public virtual Drill Drill { get; set; }

    public virtual Competency Competency { get; set; }
}
