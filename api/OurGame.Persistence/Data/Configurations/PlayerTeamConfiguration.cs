using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;
using OurGame.Persistence.Data.SeedData;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerTeamConfiguration : IEntityTypeConfiguration<PlayerTeam>
{
    public void Configure(EntityTypeBuilder<PlayerTeam> builder)
    {
        builder.ToTable("player_teams");
        builder.HasKey(pt => new { pt.PlayerId, pt.TeamId });
        
        // Seed data
        builder.HasData(PlayerTeamSeedData.GetPlayerTeams());
    }
}
