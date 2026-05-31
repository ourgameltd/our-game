#nullable disable
using System;
using System.Collections.Generic;

namespace OurGame.Persistence.Models;

/// <summary>
/// Audit-trail snapshot of a player's competency bands at a point in time. Parallel
/// to the legacy AttributeEvaluation history.
/// </summary>
public partial class PlayerCompetencyEvaluation
{
    public Guid Id { get; set; }

    public Guid PlayerId { get; set; }

    public Guid EvaluatedBy { get; set; }

    public DateTime EvaluatedAt { get; set; }

    public string CoachNotes { get; set; }

    public DateOnly? PeriodStart { get; set; }

    public DateOnly? PeriodEnd { get; set; }

    public bool IsArchived { get; set; }

    public virtual Player Player { get; set; }

    public virtual Coach EvaluatedByNavigation { get; set; }

    public virtual ICollection<PlayerCompetencyEvaluationLevel> Levels { get; set; } = new List<PlayerCompetencyEvaluationLevel>();
}
