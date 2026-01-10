using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;
using OurGame.Persistence.Data.SeedData;

namespace OurGame.Persistence.Data.Configurations;

public class TeamCoachConfiguration : IEntityTypeConfiguration<TeamCoach>
{
    public void Configure(EntityTypeBuilder<TeamCoach> builder)
    {
        builder.ToTable("team_coaches");
        builder.HasKey(tc => new { tc.TeamId, tc.CoachId });
        
        // Seed data
        builder.HasData(TeamCoachSeedData.GetTeamCoaches());
    }
}
