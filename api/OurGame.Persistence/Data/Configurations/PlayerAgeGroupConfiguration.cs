using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerAgeGroupConfiguration : IEntityTypeConfiguration<PlayerAgeGroup>
{
    public void Configure(EntityTypeBuilder<PlayerAgeGroup> builder)
    {
        builder.ToTable("PlayerAgeGroups");
        builder.HasKey(pag => new { pag.PlayerId, pag.AgeGroupId });
    }
}
