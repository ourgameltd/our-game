using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerCompetencyEvaluationLevelConfiguration : IEntityTypeConfiguration<PlayerCompetencyEvaluationLevel>
{
    public void Configure(EntityTypeBuilder<PlayerCompetencyEvaluationLevel> builder)
    {
        builder.ToTable("PlayerCompetencyEvaluationLevels");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Band).HasConversion<int>();

        builder.HasIndex(l => new { l.EvaluationId, l.CompetencyId }).IsUnique();

        builder.HasOne(l => l.Evaluation)
            .WithMany(e => e.Levels)
            .HasForeignKey(l => l.EvaluationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.Competency)
            .WithMany()
            .HasForeignKey(l => l.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
