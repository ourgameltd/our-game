using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class TrainingSessionConfiguration : IEntityTypeConfiguration<TrainingSession>
{
    public void Configure(EntityTypeBuilder<TrainingSession> builder)
    {
        builder.Property(ts => ts.Category)
            .IsRequired()
            .HasMaxLength(100)
            .HasDefaultValue("Whole Part Whole");
    }
}

public class DrillTemplateConfiguration : IEntityTypeConfiguration<DrillTemplate>
{
    public void Configure(EntityTypeBuilder<DrillTemplate> builder)
    {
        builder.Property(dt => dt.SessionCategory)
            .IsRequired()
            .HasMaxLength(100)
            .HasDefaultValue("Whole Part Whole");
    }
}
