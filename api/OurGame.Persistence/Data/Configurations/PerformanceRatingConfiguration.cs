using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PerformanceRatingConfiguration : IEntityTypeConfiguration<PerformanceRating>
{
    public void Configure(EntityTypeBuilder<PerformanceRating> builder)
    {
        builder.ToTable("performance_ratings");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.MatchReport)
            .WithMany(m => m.PerformanceRatings)
            .HasForeignKey(e => e.MatchReportId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Player)
            .WithMany()
            .HasForeignKey(e => e.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
