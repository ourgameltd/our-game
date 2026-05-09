using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class TacticPrinciplePositionOverrideConfiguration : IEntityTypeConfiguration<TacticPrinciplePositionOverride>
{
    public void Configure(EntityTypeBuilder<TacticPrinciplePositionOverride> builder)
    {
        builder.ToTable("TacticPrinciplePositionOverrides");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.XCoord).HasColumnType("decimal(18,2)");
        builder.Property(o => o.YCoord).HasColumnType("decimal(18,2)");

        builder.HasIndex(o => new { o.TacticPrincipleId, o.PositionIndex }).IsUnique();

        builder.HasOne(o => o.TacticPrinciple)
            .WithMany(p => p.PositionOverrides)
            .HasForeignKey(o => o.TacticPrincipleId);
    }
}
