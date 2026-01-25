using System.Collections.Generic;

namespace OurGame.Persistence.Models;

/// <summary>
/// Partial class to extend Team with formation link table navigation properties
/// </summary>
public partial class Team
{
    /// <summary>
    /// Formations shared with this team
    /// </summary>
    public virtual ICollection<FormationTeam> FormationTeams { get; set; } = new List<FormationTeam>();
}
