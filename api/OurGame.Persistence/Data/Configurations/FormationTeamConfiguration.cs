using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class FormationTeamConfiguration : IEntityTypeConfiguration<FormationTeam>
{
    public void Configure(EntityTypeBuilder<FormationTeam> builder)
    {
        builder.ToTable("FormationTeams");
        builder.HasKey(ft => ft.Id);

        // Unique constraint on FormationId + TeamId
        builder.HasIndex(ft => new { ft.FormationId, ft.TeamId }).IsUnique();

        builder.HasOne(ft => ft.Formation)
            .WithMany(f => f.FormationTeams)
            .HasForeignKey(ft => ft.FormationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ft => ft.Team)
            .WithMany(t => t.FormationTeams)
            .HasForeignKey(ft => ft.TeamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
