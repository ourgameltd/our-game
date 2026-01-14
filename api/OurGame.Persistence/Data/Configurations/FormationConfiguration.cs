using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class FormationConfiguration : IEntityTypeConfiguration<Formation>
{
    public void Configure(EntityTypeBuilder<Formation> builder)
    {
        builder.ToTable("formations");
        builder.HasKey(f => f.Id);

        // Self-referencing relationships
        builder.HasOne(f => f.ParentFormation)
            .WithMany(f => f.InverseParentFormation)
            .HasForeignKey(f => f.ParentFormationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.ParentTactic)
            .WithMany(f => f.InverseParentTactic)
            .HasForeignKey(f => f.ParentTacticId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
