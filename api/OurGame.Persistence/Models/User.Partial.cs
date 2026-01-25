using System.Collections.Generic;

namespace OurGame.Persistence.Models;

/// <summary>
/// Partial class to extend User with formation link table navigation properties
/// </summary>
public partial class User
{
    /// <summary>
    /// Formations owned by or shared with this user
    /// </summary>
    public virtual ICollection<FormationUser> FormationUsers { get; set; } = new List<FormationUser>();
}
