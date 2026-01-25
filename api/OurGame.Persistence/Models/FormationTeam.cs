#nullable disable
using System;

namespace OurGame.Persistence.Models;

/// <summary>
/// Link table for Formation to Team (many-to-many relationship)
/// Allows formations/tactics to be shared with specific teams
/// </summary>
public partial class FormationTeam
{
    public Guid Id { get; set; }

    public Guid FormationId { get; set; }

    public Guid TeamId { get; set; }

    /// <summary>
    /// When the formation was shared with this team
    /// </summary>
    public DateTime SharedAt { get; set; }

    public virtual Formation Formation { get; set; }

    public virtual Team Team { get; set; }
}
