using System.Collections.Generic;

namespace OurGame.Persistence.Models;

public partial class Club
{
    public virtual ICollection<ClubMediaLink> ClubMediaLinks { get; set; } = new List<ClubMediaLink>();
}
