using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class MatchReportConfiguration : IEntityTypeConfiguration<MatchReport>
{
    public void Configure(EntityTypeBuilder<MatchReport> builder)
    {
        builder.ToTable("match_reports");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Match)
            .WithMany(m => m.MatchReports)
            .HasForeignKey(e => e.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Captain)
            .WithMany()
            .HasForeignKey(e => e.CaptainId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.PlayerOfMatch)
            .WithMany()
            .HasForeignKey(e => e.PlayerOfMatchId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
