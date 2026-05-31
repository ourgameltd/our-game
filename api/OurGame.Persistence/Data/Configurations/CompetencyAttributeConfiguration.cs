using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class CompetencyAttributeConfiguration : IEntityTypeConfiguration<CompetencyAttribute>
{
    public void Configure(EntityTypeBuilder<CompetencyAttribute> builder)
    {
        builder.ToTable("CompetencyAttributes");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Name).HasMaxLength(128).IsRequired();
        builder.HasIndex(a => a.Name).IsUnique();

        builder.HasOne(a => a.Category)
            .WithMany(c => c.Attributes)
            .HasForeignKey(a => a.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Competency)
            .WithMany(c => c.Attributes)
            .HasForeignKey(a => a.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
