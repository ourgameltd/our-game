using System.Collections.Generic;

namespace OurGame.Persistence.Models;

/// <summary>
/// Partial class to extend Formation with link table navigation properties
/// </summary>
public partial class Formation
{
    /// <summary>
    /// Clubs this formation is shared with
    /// </summary>
    public virtual ICollection<FormationClub> FormationClubs { get; set; } = new List<FormationClub>();

    /// <summary>
    /// Age groups this formation is shared with
    /// </summary>
    public virtual ICollection<FormationAgeGroup> FormationAgeGroups { get; set; } = new List<FormationAgeGroup>();

    /// <summary>
    /// Teams this formation is shared with
    /// </summary>
    public virtual ICollection<FormationTeam> FormationTeams { get; set; } = new List<FormationTeam>();

    /// <summary>
    /// Users this formation is owned by or shared with
    /// </summary>
    public virtual ICollection<FormationUser> FormationUsers { get; set; } = new List<FormationUser>();
}
