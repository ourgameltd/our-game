using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class CompetencyFrameworkAttributeWeightConfiguration : IEntityTypeConfiguration<CompetencyFrameworkAttributeWeight>
{
    public void Configure(EntityTypeBuilder<CompetencyFrameworkAttributeWeight> builder)
    {
        builder.ToTable("CompetencyFrameworkAttributeWeights");
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Format).HasConversion<int>();
        builder.Property(w => w.IsGoalkeeper).HasDefaultValue(false);

        builder.HasIndex(w => new { w.FrameworkId, w.AttributeId, w.Format, w.IsGoalkeeper }).IsUnique();

        builder.HasOne(w => w.Framework)
            .WithMany(f => f.AttributeWeights)
            .HasForeignKey(w => w.FrameworkId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(w => w.Attribute)
            .WithMany()
            .HasForeignKey(w => w.AttributeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
