using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class GoalConfiguration : IEntityTypeConfiguration<Goal>
{
    public void Configure(EntityTypeBuilder<Goal> builder)
    {
        builder.ToTable("Goals");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.MatchReport)
            .WithMany(m => m.Goals)
            .HasForeignKey(e => e.MatchReportId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(e => e.OpponentName).HasMaxLength(200);

        builder.HasOne(e => e.Player)
            .WithMany()
            .HasForeignKey(e => e.PlayerId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.AssistPlayer)
            .WithMany()
            .HasForeignKey(e => e.AssistPlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
