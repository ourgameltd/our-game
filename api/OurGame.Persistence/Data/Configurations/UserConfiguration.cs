using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        
        builder.HasKey(u => u.Id);
        
        builder.Property(u => u.Id)
            .HasDefaultValueSql("NEWID()");
            
        builder.Property(u => u.Email)
            .HasMaxLength(255)
            .IsRequired();
            
        builder.HasIndex(u => u.Email)
            .IsUnique();
            
        builder.Property(u => u.FirstName)
            .HasMaxLength(100);
            
        builder.Property(u => u.LastName)
            .HasMaxLength(100);
            
        builder.Property(u => u.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
            
        builder.Property(u => u.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}
