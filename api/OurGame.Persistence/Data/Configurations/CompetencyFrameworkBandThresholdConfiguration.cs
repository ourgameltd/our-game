using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class CompetencyFrameworkBandThresholdConfiguration : IEntityTypeConfiguration<CompetencyFrameworkBandThreshold>
{
    public void Configure(EntityTypeBuilder<CompetencyFrameworkBandThreshold> builder)
    {
        builder.ToTable("CompetencyFrameworkBandThresholds");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Band).HasConversion<int>();
        builder.Property(t => t.Threshold).HasPrecision(6, 2);

        builder.HasIndex(t => new { t.FrameworkId, t.Band }).IsUnique();

        builder.HasOne(t => t.Framework)
            .WithMany(f => f.BandThresholds)
            .HasForeignKey(t => t.FrameworkId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
