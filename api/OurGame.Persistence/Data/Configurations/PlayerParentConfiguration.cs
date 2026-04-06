using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerParentConfiguration : IEntityTypeConfiguration<PlayerParent>
{
    public void Configure(EntityTypeBuilder<PlayerParent> builder)
    {
        builder.ToTable("PlayerParents");
        builder.HasKey(pp => pp.Id);

        builder.Property(pp => pp.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(pp => pp.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(pp => pp.Phone)
            .HasMaxLength(20);

        builder.HasOne(pp => pp.ParentUser)
            .WithMany("PlayerParents")
            .HasForeignKey(pp => pp.ParentUserId)
            .HasConstraintName("FK_PlayerParents_Users_ParentUserId")
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasOne(pp => pp.Player)
            .WithMany("PlayerParents")
            .HasForeignKey(pp => pp.PlayerId)
            .HasConstraintName("FK_PlayerParents_Players_PlayerId")
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();
    }
}
