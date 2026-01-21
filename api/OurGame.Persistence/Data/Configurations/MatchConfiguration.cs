using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.ToTable("Matches");
        builder.HasKey(m => m.Id);

        // Multiple relationships to Kit
        builder.HasOne(m => m.PrimaryKit)
            .WithMany(k => k.MatchPrimaryKits)
            .HasForeignKey(m => m.PrimaryKitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.SecondaryKit)
            .WithMany(k => k.MatchSecondaryKits)
            .HasForeignKey(m => m.SecondaryKitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.GoalkeeperKit)
            .WithMany(k => k.MatchGoalkeeperKits)
            .HasForeignKey(m => m.GoalkeeperKitId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
