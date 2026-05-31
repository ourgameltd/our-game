using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class CompetencyCategoryConfiguration : IEntityTypeConfiguration<CompetencyCategory>
{
    public void Configure(EntityTypeBuilder<CompetencyCategory> builder)
    {
        builder.ToTable("CompetencyCategories");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).HasMaxLength(64).IsRequired();
        builder.HasIndex(c => c.Name).IsUnique();
    }
}
