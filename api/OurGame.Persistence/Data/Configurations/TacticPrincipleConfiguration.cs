using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class TacticPrincipleConfiguration : IEntityTypeConfiguration<TacticPrinciple>
{
    public void Configure(EntityTypeBuilder<TacticPrinciple> builder)
    {
        builder.ToTable("TacticPrinciples");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Formation)
            .WithMany()
            .HasForeignKey(e => e.FormationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
