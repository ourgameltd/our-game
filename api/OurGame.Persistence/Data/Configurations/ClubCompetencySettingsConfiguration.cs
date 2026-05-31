using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class ClubCompetencySettingsConfiguration : IEntityTypeConfiguration<ClubCompetencySettings>
{
    public void Configure(EntityTypeBuilder<ClubCompetencySettings> builder)
    {
        builder.ToTable("ClubCompetencySettings");
        builder.HasKey(s => s.Id);
        builder.HasIndex(s => s.ClubId).IsUnique();

        builder.HasOne(s => s.Club)
            .WithMany()
            .HasForeignKey(s => s.ClubId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
