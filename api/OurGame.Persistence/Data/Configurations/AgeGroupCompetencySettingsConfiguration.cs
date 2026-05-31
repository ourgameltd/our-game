using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class AgeGroupCompetencySettingsConfiguration : IEntityTypeConfiguration<AgeGroupCompetencySettings>
{
    public void Configure(EntityTypeBuilder<AgeGroupCompetencySettings> builder)
    {
        builder.ToTable("AgeGroupCompetencySettings");
        builder.HasKey(s => s.Id);
        builder.HasIndex(s => s.AgeGroupId).IsUnique();

        builder.HasOne(s => s.AgeGroup)
            .WithMany()
            .HasForeignKey(s => s.AgeGroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
