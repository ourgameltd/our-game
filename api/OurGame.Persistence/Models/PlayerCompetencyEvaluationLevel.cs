#nullable disable
using System;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

public partial class PlayerCompetencyEvaluationLevel
{
    public Guid Id { get; set; }

    public Guid EvaluationId { get; set; }

    public Guid CompetencyId { get; set; }

    public CompetencyBand Band { get; set; }

    public virtual PlayerCompetencyEvaluation Evaluation { get; set; }

    public virtual Competency Competency { get; set; }
}
