using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(n => n.Type)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(n => n.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(n => n.Message)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(n => n.Url)
            .HasMaxLength(500);

        builder.Property(n => n.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(n => n.UserId)
            .HasDatabaseName("IX_Notifications_UserId");

        builder.HasIndex(n => n.CreatedAt)
            .HasDatabaseName("IX_Notifications_CreatedAt");

        builder.HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .HasConstraintName("FK_Notifications_Users")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
