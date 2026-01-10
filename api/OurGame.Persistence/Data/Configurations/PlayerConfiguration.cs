using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;
using OurGame.Persistence.Data.SeedData;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerConfiguration : IEntityTypeConfiguration<Player>
{
    public void Configure(EntityTypeBuilder<Player> builder)
    {
        builder.ToTable("players");
        builder.HasKey(p => p.Id);
        
        // Seed data
        builder.HasData(PlayerSeedData.GetPlayers());
    }
}
