using System.Collections.Generic;

namespace OurGame.Persistence.Models;

/// <summary>
/// Partial class to extend Club with formation link table navigation properties
/// </summary>
public partial class Club
{
    /// <summary>
    /// Formations shared with this club
    /// </summary>
    public virtual ICollection<FormationClub> FormationClubs { get; set; } = new List<FormationClub>();
}
