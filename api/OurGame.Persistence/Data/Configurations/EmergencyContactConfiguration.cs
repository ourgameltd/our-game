using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class EmergencyContactConfiguration : IEntityTypeConfiguration<EmergencyContact>
{
    public void Configure(EntityTypeBuilder<EmergencyContact> builder)
    {
        builder.ToTable("EmergencyContacts");
        builder.HasKey(ec => ec.Id);

        builder.Property(ec => ec.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(ec => ec.Phone)
            .HasMaxLength(20);

        builder.Property(ec => ec.Email)
            .HasMaxLength(255);

        builder.Property(ec => ec.Relationship)
            .HasMaxLength(100);

        builder.HasOne(ec => ec.Player)
            .WithMany(p => p.EmergencyContacts)
            .HasForeignKey(ec => ec.PlayerId)
            .HasConstraintName("FK_EmergencyContacts_Players_PlayerId")
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasOne(ec => ec.Coach)
            .WithMany(c => c.EmergencyContacts)
            .HasForeignKey(ec => ec.CoachId)
            .HasConstraintName("FK_EmergencyContacts_Coaches_CoachId")
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasOne(ec => ec.User)
            .WithMany(u => u.EmergencyContacts)
            .HasForeignKey(ec => ec.UserId)
            .HasConstraintName("FK_EmergencyContacts_Users_UserId")
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasIndex(ec => ec.PlayerId)
            .HasDatabaseName("IX_EmergencyContacts_PlayerId");

        builder.HasIndex(ec => ec.CoachId)
            .HasDatabaseName("IX_EmergencyContacts_CoachId");

        builder.HasIndex(ec => ec.UserId)
            .HasDatabaseName("IX_EmergencyContacts_UserId");
    }
}
