using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class LineupPlayerConfiguration : IEntityTypeConfiguration<LineupPlayer>
{
    public void Configure(EntityTypeBuilder<LineupPlayer> builder)
    {
        builder.ToTable("LineupPlayers");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Lineup)
            .WithMany(l => l.LineupPlayers)
            .HasForeignKey(e => e.LineupId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Player)
            .WithMany()
            .HasForeignKey(e => e.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
