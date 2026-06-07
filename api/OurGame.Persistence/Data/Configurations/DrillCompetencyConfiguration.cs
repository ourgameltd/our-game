using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class DrillCompetencyConfiguration : IEntityTypeConfiguration<DrillCompetency>
{
    public void Configure(EntityTypeBuilder<DrillCompetency> builder)
    {
        builder.ToTable("DrillCompetencies");
        builder.HasKey(dc => dc.Id);

        builder.HasIndex(dc => new { dc.DrillId, dc.CompetencyId }).IsUnique();

        builder.HasOne(dc => dc.Drill)
            .WithMany(d => d.DrillCompetencies)
            .HasForeignKey(dc => dc.DrillId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(dc => dc.Competency)
            .WithMany()
            .HasForeignKey(dc => dc.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
