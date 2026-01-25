using Microsoft.EntityFrameworkCore;

namespace OurGame.Persistence.Models;

/// <summary>
/// Partial class to extend OurGameContext with formation link table DbSets
/// </summary>
public partial class OurGameContext
{
    public virtual DbSet<FormationClub> FormationClubs { get; set; }
    public virtual DbSet<FormationAgeGroup> FormationAgeGroups { get; set; }
    public virtual DbSet<FormationTeam> FormationTeams { get; set; }
    public virtual DbSet<FormationUser> FormationUsers { get; set; }
}
