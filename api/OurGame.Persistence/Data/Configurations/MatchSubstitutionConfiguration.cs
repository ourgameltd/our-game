using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class MatchSubstitutionConfiguration : IEntityTypeConfiguration<MatchSubstitution>
{
    public void Configure(EntityTypeBuilder<MatchSubstitution> builder)
    {
        builder.ToTable("MatchSubstitutions");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Match)
            .WithMany(m => m.MatchSubstitutions)
            .HasForeignKey(e => e.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.PlayerOut)
            .WithMany()
            .HasForeignKey(e => e.PlayerOutId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.PlayerIn)
            .WithMany()
            .HasForeignKey(e => e.PlayerInId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
