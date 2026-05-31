using Microsoft.EntityFrameworkCore;

namespace OurGame.Persistence.Models;

/// <summary>
/// DbSet registrations for the competency framework feature.
/// </summary>
public partial class OurGameContext
{
    public virtual DbSet<CompetencyCategory> CompetencyCategories { get; set; }

    public virtual DbSet<Competency> Competencies { get; set; }

    public virtual DbSet<CompetencyAttribute> CompetencyAttributes { get; set; }

    public virtual DbSet<CompetencyFramework> CompetencyFrameworks { get; set; }

    public virtual DbSet<CompetencyFrameworkBandThreshold> CompetencyFrameworkBandThresholds { get; set; }

    public virtual DbSet<CompetencyFrameworkCompetencyDescription> CompetencyFrameworkCompetencyDescriptions { get; set; }

    public virtual DbSet<CompetencyFrameworkAttributeWeight> CompetencyFrameworkAttributeWeights { get; set; }

    public virtual DbSet<CompetencyFrameworkAssignment> CompetencyFrameworkAssignments { get; set; }

    public virtual DbSet<ClubCompetencySettings> ClubCompetencySettings { get; set; }

    public virtual DbSet<AgeGroupCompetencySettings> AgeGroupCompetencySettings { get; set; }

    public virtual DbSet<PlayerCompetencyLevel> PlayerCompetencyLevels { get; set; }

    public virtual DbSet<PlayerCompetencyEvaluation> PlayerCompetencyEvaluations { get; set; }

    public virtual DbSet<PlayerCompetencyEvaluationLevel> PlayerCompetencyEvaluationLevels { get; set; }

    public virtual DbSet<PlayerTeamScore> PlayerTeamScores { get; set; }
}
