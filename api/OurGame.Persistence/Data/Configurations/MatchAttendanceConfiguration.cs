using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class MatchAttendanceConfiguration : IEntityTypeConfiguration<MatchAttendance>
{
    public void Configure(EntityTypeBuilder<MatchAttendance> builder)
    {
        builder.ToTable("MatchAttendances");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.MatchId)
            .IsRequired();

        builder.Property(e => e.PlayerId)
            .IsRequired();

        builder.Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Notes)
            .HasMaxLength(500);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .IsRequired();

        // Unique constraint to prevent duplicate attendance records
        builder.HasIndex(e => new { e.MatchId, e.PlayerId })
            .IsUnique()
            .HasDatabaseName("IX_MatchAttendances_MatchId_PlayerId");

        // Foreign key relationships
        builder.HasOne(e => e.Match)
            .WithMany(m => m.MatchAttendances)
            .HasForeignKey(e => e.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Player)
            .WithMany()
            .HasForeignKey(e => e.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
