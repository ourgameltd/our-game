using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class CoachConfiguration : IEntityTypeConfiguration<Coach>
{
    public void Configure(EntityTypeBuilder<Coach> builder)
    {
        builder.ToTable("Coaches");
        builder.HasKey(c => c.Id);
        
        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .HasConstraintName("FK_Coaches_Users")
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasIndex(c => c.UserId)
            .HasDatabaseName("IX_Coaches_UserId");
    }
}
