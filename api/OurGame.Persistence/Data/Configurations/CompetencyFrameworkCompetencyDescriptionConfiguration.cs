using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class CompetencyFrameworkCompetencyDescriptionConfiguration : IEntityTypeConfiguration<CompetencyFrameworkCompetencyDescription>
{
    public void Configure(EntityTypeBuilder<CompetencyFrameworkCompetencyDescription> builder)
    {
        builder.ToTable("CompetencyFrameworkCompetencyDescriptions");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Band).HasConversion<int>();
        builder.Property(d => d.Description).HasMaxLength(1024).IsRequired();

        builder.HasIndex(d => new { d.FrameworkId, d.CompetencyId, d.Band }).IsUnique();

        builder.HasOne(d => d.Framework)
            .WithMany(f => f.CompetencyDescriptions)
            .HasForeignKey(d => d.FrameworkId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Competency)
            .WithMany()
            .HasForeignKey(d => d.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
