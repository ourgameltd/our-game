#nullable disable
using System;

namespace OurGame.Persistence.Models;

/// <summary>
/// Link table for Formation to AgeGroup (many-to-many relationship)
/// Allows formations/tactics to be shared with specific age groups
/// </summary>
public partial class FormationAgeGroup
{
    public Guid Id { get; set; }

    public Guid FormationId { get; set; }

    public Guid AgeGroupId { get; set; }

    /// <summary>
    /// When the formation was shared with this age group
    /// </summary>
    public DateTime SharedAt { get; set; }

    public virtual Formation Formation { get; set; }

    public virtual AgeGroup AgeGroup { get; set; }
}
