using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerCompetencyLevelConfiguration : IEntityTypeConfiguration<PlayerCompetencyLevel>
{
    public void Configure(EntityTypeBuilder<PlayerCompetencyLevel> builder)
    {
        builder.ToTable("PlayerCompetencyLevels");
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Band).HasConversion<int>();

        builder.HasIndex(l => new { l.PlayerId, l.CompetencyId }).IsUnique();

        builder.HasOne(l => l.Player)
            .WithMany()
            .HasForeignKey(l => l.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.Competency)
            .WithMany()
            .HasForeignKey(l => l.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.UpdatedByCoach)
            .WithMany()
            .HasForeignKey(l => l.UpdatedByCoachId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
