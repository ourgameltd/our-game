#nullable disable
using System;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

/// <summary>
/// Authoritative input for the competency system: one band per competency per player.
/// 9 rows per player.
/// </summary>
public partial class PlayerCompetencyLevel
{
    public Guid Id { get; set; }

    public Guid PlayerId { get; set; }

    public Guid CompetencyId { get; set; }

    public CompetencyBand Band { get; set; }

    public Guid? UpdatedByCoachId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Player Player { get; set; }

    public virtual Competency Competency { get; set; }

    public virtual Coach UpdatedByCoach { get; set; }
}
