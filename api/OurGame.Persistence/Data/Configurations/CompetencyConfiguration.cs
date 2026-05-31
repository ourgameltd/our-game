using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class CompetencyConfiguration : IEntityTypeConfiguration<Competency>
{
    public void Configure(EntityTypeBuilder<Competency> builder)
    {
        builder.ToTable("Competencies");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).HasMaxLength(128).IsRequired();
        builder.HasIndex(c => c.Name).IsUnique();
    }
}
