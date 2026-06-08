using System.Collections.Generic;

namespace OurGame.Persistence.Models;

/// <summary>
/// Partial class to extend Drill with link table navigation properties
/// </summary>
public partial class Drill
{
    public bool IsArchived { get; set; }

    /// <summary>
    /// Clubs this drill is shared with
    /// </summary>
    public virtual ICollection<DrillClub> DrillClubs { get; set; } = new List<DrillClub>();

    /// <summary>
    /// Age groups this drill is shared with
    /// </summary>
    public virtual ICollection<DrillAgeGroup> DrillAgeGroups { get; set; } = new List<DrillAgeGroup>();

    /// <summary>
    /// Teams this drill is shared with
    /// </summary>
    public virtual ICollection<DrillTeam> DrillTeams { get; set; } = new List<DrillTeam>();

    /// <summary>
    /// Users this drill is owned by or shared with
    /// </summary>
    public virtual ICollection<DrillUser> DrillUsers { get; set; } = new List<DrillUser>();
}
