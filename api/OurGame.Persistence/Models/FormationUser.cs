#nullable disable
using System;

namespace OurGame.Persistence.Models;

/// <summary>
/// Link table for Formation to User (many-to-many relationship)
/// Allows formations/tactics to be owned by or shared with users privately
/// </summary>
public partial class FormationUser
{
    public Guid Id { get; set; }

    public Guid FormationId { get; set; }

    public Guid UserId { get; set; }

    /// <summary>
    /// Whether this user is the owner/creator of the formation
    /// </summary>
    public bool IsOwner { get; set; }

    /// <summary>
    /// When the formation was shared with or created by this user
    /// </summary>
    public DateTime SharedAt { get; set; }

    public virtual Formation Formation { get; set; }

    public virtual User User { get; set; }
}
