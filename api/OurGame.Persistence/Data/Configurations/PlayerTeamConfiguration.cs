using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerTeamConfiguration : IEntityTypeConfiguration<PlayerTeam>
{
    public void Configure(EntityTypeBuilder<PlayerTeam> builder)
    {
        builder.ToTable("player_teams");
        builder.HasKey(pt => new { pt.PlayerId, pt.TeamId });
    }
}
