using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;
using OurGame.Persistence.Data.SeedData;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerAttributeConfiguration : IEntityTypeConfiguration<PlayerAttribute>
{
    public void Configure(EntityTypeBuilder<PlayerAttribute> builder)
    {
        builder.ToTable("player_attributes");
        builder.HasKey(pa => pa.Id);
        
        // Seed data
        builder.HasData(PlayerAttributeSeedData.GetPlayerAttributes());
    }
}
