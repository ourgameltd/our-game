using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;
using OurGame.Persistence.Data.SeedData;

namespace OurGame.Persistence.Data.Configurations;

public class AgeGroupConfiguration : IEntityTypeConfiguration<AgeGroup>
{
    public void Configure(EntityTypeBuilder<AgeGroup> builder)
    {
        builder.ToTable("age_groups");
        builder.HasKey(ag => ag.Id);
        
        // Seed data
        builder.HasData(AgeGroupSeedData.GetAgeGroups());
    }
}
