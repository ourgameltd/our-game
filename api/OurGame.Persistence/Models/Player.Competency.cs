using System.Collections.Generic;
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

/// <summary>
/// Player extensions for the competency framework feature. OverallBand is the
/// derived band for the player's primary team; OverallRating (existing column)
/// now stores the boosted score from the same team's PlayerTeamScore row.
/// </summary>
public partial class Player
{
    public CompetencyBand? OverallBand { get; set; }

    public virtual ICollection<PlayerCompetencyLevel> CompetencyLevels { get; set; } = new List<PlayerCompetencyLevel>();

    public virtual ICollection<PlayerCompetencyEvaluation> CompetencyEvaluations { get; set; } = new List<PlayerCompetencyEvaluation>();

    public virtual ICollection<PlayerTeamScore> TeamScores { get; set; } = new List<PlayerTeamScore>();
}
