using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class FormationAgeGroupConfiguration : IEntityTypeConfiguration<FormationAgeGroup>
{
    public void Configure(EntityTypeBuilder<FormationAgeGroup> builder)
    {
        builder.ToTable("FormationAgeGroups");
        builder.HasKey(fa => fa.Id);

        // Unique constraint on FormationId + AgeGroupId
        builder.HasIndex(fa => new { fa.FormationId, fa.AgeGroupId }).IsUnique();

        builder.HasOne(fa => fa.Formation)
            .WithMany(f => f.FormationAgeGroups)
            .HasForeignKey(fa => fa.FormationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(fa => fa.AgeGroup)
            .WithMany(a => a.FormationAgeGroups)
            .HasForeignKey(fa => fa.AgeGroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
