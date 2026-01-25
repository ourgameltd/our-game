using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class FormationUserConfiguration : IEntityTypeConfiguration<FormationUser>
{
    public void Configure(EntityTypeBuilder<FormationUser> builder)
    {
        builder.ToTable("FormationUsers");
        builder.HasKey(fu => fu.Id);

        // Unique constraint on FormationId + UserId
        builder.HasIndex(fu => new { fu.FormationId, fu.UserId }).IsUnique();

        builder.HasOne(fu => fu.Formation)
            .WithMany(f => f.FormationUsers)
            .HasForeignKey(fu => fu.FormationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(fu => fu.User)
            .WithMany(u => u.FormationUsers)
            .HasForeignKey(fu => fu.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
