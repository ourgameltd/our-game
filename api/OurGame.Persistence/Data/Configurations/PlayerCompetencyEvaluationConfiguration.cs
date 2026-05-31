using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerCompetencyEvaluationConfiguration : IEntityTypeConfiguration<PlayerCompetencyEvaluation>
{
    public void Configure(EntityTypeBuilder<PlayerCompetencyEvaluation> builder)
    {
        builder.ToTable("PlayerCompetencyEvaluations");
        builder.HasKey(e => e.Id);

        builder.HasIndex(e => new { e.PlayerId, e.EvaluatedAt });

        builder.HasOne(e => e.Player)
            .WithMany()
            .HasForeignKey(e => e.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.EvaluatedByNavigation)
            .WithMany()
            .HasForeignKey(e => e.EvaluatedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
