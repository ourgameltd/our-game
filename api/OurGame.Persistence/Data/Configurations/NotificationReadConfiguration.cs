using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class NotificationReadConfiguration : IEntityTypeConfiguration<NotificationRead>
{
    public void Configure(EntityTypeBuilder<NotificationRead> builder)
    {
        builder.ToTable("NotificationReads");

        builder.HasKey(nr => nr.Id);

        builder.Property(nr => nr.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(nr => nr.ReadAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(nr => new { nr.NotificationId, nr.UserId })
            .IsUnique()
            .HasDatabaseName("UX_NotificationReads_NotificationId_UserId");

        builder.HasIndex(nr => nr.UserId)
            .HasDatabaseName("IX_NotificationReads_UserId");

        builder.HasOne(nr => nr.Notification)
            .WithMany()
            .HasForeignKey(nr => nr.NotificationId)
            .HasConstraintName("FK_NotificationReads_Notifications")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(nr => nr.User)
            .WithMany(u => u.NotificationReads)
            .HasForeignKey(nr => nr.UserId)
            .HasConstraintName("FK_NotificationReads_Users")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
