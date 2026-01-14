using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class FormationPositionConfiguration : IEntityTypeConfiguration<FormationPosition>
{
    public void Configure(EntityTypeBuilder<FormationPosition> builder)
    {
        builder.ToTable("formation_positions");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Formation)
            .WithMany(f => f.FormationPositions)
            .HasForeignKey(e => e.FormationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
