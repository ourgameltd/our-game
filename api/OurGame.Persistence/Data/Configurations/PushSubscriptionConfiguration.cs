using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PushSubscriptionConfiguration : IEntityTypeConfiguration<PushSubscription>
{
    public void Configure(EntityTypeBuilder<PushSubscription> builder)
    {
        builder.ToTable("PushSubscriptions");
        builder.HasKey(ps => ps.Id);

        builder.Property(ps => ps.Id)
            .HasDefaultValueSql("NEWSEQUENTIALID()");

        builder.Property(ps => ps.Endpoint)
            .IsRequired()
            .HasMaxLength(2048);

        builder.Property(ps => ps.P256dh)
            .IsRequired()
            .HasMaxLength(512);

        builder.Property(ps => ps.Auth)
            .IsRequired()
            .HasMaxLength(512);

        builder.Property(ps => ps.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Each endpoint is unique – prevents duplicate subscriptions
        builder.HasIndex(ps => ps.Endpoint)
            .IsUnique();

        builder.HasOne(ps => ps.User)
            .WithMany()
            .HasForeignKey(ps => ps.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
