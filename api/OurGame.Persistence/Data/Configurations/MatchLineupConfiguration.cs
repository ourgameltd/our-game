using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class MatchLineupConfiguration : IEntityTypeConfiguration<MatchLineup>
{
    public void Configure(EntityTypeBuilder<MatchLineup> builder)
    {
        builder.ToTable("match_lineups");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Match)
            .WithMany(m => m.MatchLineups)
            .HasForeignKey(e => e.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Formation)
            .WithMany()
            .HasForeignKey(e => e.FormationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Tactic)
            .WithMany()
            .HasForeignKey(e => e.TacticId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
