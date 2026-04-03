using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class ClubMediaLinkConfiguration : IEntityTypeConfiguration<ClubMediaLink>
{
    public void Configure(EntityTypeBuilder<ClubMediaLink> builder)
    {
        builder.ToTable("ClubMediaLinks");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Url).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Title).HasMaxLength(200);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        builder.Property(x => x.DisplayOrder).HasDefaultValue(0);

        builder.HasIndex(x => new { x.ClubId, x.DisplayOrder });

        builder.HasOne(x => x.Club)
            .WithMany(c => c.ClubMediaLinks)
            .HasForeignKey(x => x.ClubId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
