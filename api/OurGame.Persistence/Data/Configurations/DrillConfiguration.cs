using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class DrillConfiguration : IEntityTypeConfiguration<Drill>
{
    public void Configure(EntityTypeBuilder<Drill> builder)
    {
        builder.ToTable("Drills");
        builder.HasKey(d => d.Id);

        // Seed data
    }
}
