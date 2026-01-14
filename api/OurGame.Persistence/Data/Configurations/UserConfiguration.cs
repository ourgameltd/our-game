using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        
        builder.HasKey(u => u.Id);
        
        builder.Property(u => u.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("NEWID()");
            
        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();
            
        builder.HasIndex(u => u.Email)
            .IsUnique();
            
        builder.Property(u => u.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100);
            
        builder.Property(u => u.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100);
            
        builder.Property(u => u.Role)
            .HasColumnName("role")
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(u => u.ClubId)
            .HasColumnName("club_id");
            
        builder.Property(u => u.PlayerId)
            .HasColumnName("player_id");
            
        builder.Property(u => u.StaffId)
            .HasColumnName("staff_id");
            
        builder.Property(u => u.Photo)
            .HasColumnName("photo");
            
        builder.Property(u => u.Preferences)
            .HasColumnName("preferences");
            
        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("GETUTCDATE()");
            
        builder.Property(u => u.UpdatedAt)
            .HasColumnName("updated_at")
            .HasDefaultValueSql("GETUTCDATE()");
            
        builder.HasOne(u => u.Club)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.ClubId)
            .HasConstraintName("FK_users_clubs");
            
        builder.HasIndex(u => u.ClubId)
            .HasDatabaseName("IX_users_club_id");
            
        builder.HasIndex(u => u.PlayerId)
            .HasDatabaseName("IX_users_player_id");
            
        builder.HasIndex(u => u.StaffId)
            .HasDatabaseName("IX_users_staff_id");
    }
}
