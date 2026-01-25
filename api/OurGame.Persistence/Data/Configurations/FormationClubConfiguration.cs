using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class FormationClubConfiguration : IEntityTypeConfiguration<FormationClub>
{
    public void Configure(EntityTypeBuilder<FormationClub> builder)
    {
        builder.ToTable("FormationClubs");
        builder.HasKey(fc => fc.Id);

        // Unique constraint on FormationId + ClubId
        builder.HasIndex(fc => new { fc.FormationId, fc.ClubId }).IsUnique();

        builder.HasOne(fc => fc.Formation)
            .WithMany(f => f.FormationClubs)
            .HasForeignKey(fc => fc.FormationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(fc => fc.Club)
            .WithMany(c => c.FormationClubs)
            .HasForeignKey(fc => fc.ClubId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
