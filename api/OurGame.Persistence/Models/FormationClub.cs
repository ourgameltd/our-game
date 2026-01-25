#nullable disable
using System;

namespace OurGame.Persistence.Models;

/// <summary>
/// Link table for Formation to Club (many-to-many relationship)
/// Allows formations/tactics to be shared with clubs
/// </summary>
public partial class FormationClub
{
    public Guid Id { get; set; }

    public Guid FormationId { get; set; }

    public Guid ClubId { get; set; }

    /// <summary>
    /// When the formation was shared with this club
    /// </summary>
    public DateTime SharedAt { get; set; }

    public virtual Formation Formation { get; set; }

    public virtual Club Club { get; set; }
}
