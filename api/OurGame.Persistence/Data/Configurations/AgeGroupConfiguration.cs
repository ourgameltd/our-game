using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class AgeGroupConfiguration : IEntityTypeConfiguration<AgeGroup>
{
    public void Configure(EntityTypeBuilder<AgeGroup> builder)
    {
        builder.ToTable("age_groups");
        builder.HasKey(ag => ag.Id);
    }
}
