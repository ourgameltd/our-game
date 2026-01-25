using System.Collections.Generic;

namespace OurGame.Persistence.Models;

/// <summary>
/// Partial class to extend AgeGroup with formation link table navigation properties
/// </summary>
public partial class AgeGroup
{
    /// <summary>
    /// Formations shared with this age group
    /// </summary>
    public virtual ICollection<FormationAgeGroup> FormationAgeGroups { get; set; } = new List<FormationAgeGroup>();
}
