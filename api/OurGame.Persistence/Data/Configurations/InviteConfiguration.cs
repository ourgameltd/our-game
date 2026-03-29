using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class InviteConfiguration : IEntityTypeConfiguration<Invite>
{
    public void Configure(EntityTypeBuilder<Invite> builder)
    {
        builder.ToTable("Invites");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .HasDefaultValueSql("NEWID()");

        builder.Property(i => i.Code)
            .HasMaxLength(8)
            .IsRequired();

        builder.Property(i => i.Email)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(i => i.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(i => i.Code)
            .IsUnique()
            .HasDatabaseName("UX_Invites_Code");

        builder.HasIndex(new[] { "Email", "Status" })
            .HasDatabaseName("IX_Invites_Email_Status");

        builder.HasIndex(i => i.EntityId)
            .HasDatabaseName("IX_Invites_EntityId");

        builder.HasIndex(i => i.ClubId)
            .HasDatabaseName("IX_Invites_ClubId");

        builder.HasOne(i => i.Club)
            .WithMany()
            .HasForeignKey(i => i.ClubId)
            .HasConstraintName("FK_Invites_Clubs")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.AcceptedByUser)
            .WithMany()
            .HasForeignKey(i => i.AcceptedByUserId)
            .HasConstraintName("FK_Invites_Users_AcceptedBy")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
