using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerTeamScoreConfiguration : IEntityTypeConfiguration<PlayerTeamScore>
{
    public void Configure(EntityTypeBuilder<PlayerTeamScore> builder)
    {
        builder.ToTable("PlayerTeamScores");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Format).HasConversion<int>();
        builder.Property(s => s.Band).HasConversion<int>();
        builder.Property(s => s.BaseScore).HasPrecision(6, 2);
        builder.Property(s => s.BoostedScore).HasPrecision(6, 2);

        builder.HasIndex(s => new { s.PlayerId, s.TeamId }).IsUnique();

        builder.HasOne(s => s.Player)
            .WithMany()
            .HasForeignKey(s => s.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Team)
            .WithMany()
            .HasForeignKey(s => s.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Framework)
            .WithMany()
            .HasForeignKey(s => s.FrameworkId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
