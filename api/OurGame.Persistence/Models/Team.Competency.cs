using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

/// <summary>
/// Team extensions for the competency framework feature: per-team game format
/// (5s/7s/9s/11s) drives which weighting profile is applied when calculating
/// a player's score for this team.
/// </summary>
public partial class Team
{
    public GameFormat? Format { get; set; }
}
