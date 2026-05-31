using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class CompetencyFrameworkAssignmentConfiguration : IEntityTypeConfiguration<CompetencyFrameworkAssignment>
{
    public void Configure(EntityTypeBuilder<CompetencyFrameworkAssignment> builder)
    {
        builder.ToTable("CompetencyFrameworkAssignments");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Scope).HasConversion<int>();

        builder.HasIndex(a => a.ClubId).IsUnique().HasFilter("[ClubId] IS NOT NULL");
        builder.HasIndex(a => a.AgeGroupId).IsUnique().HasFilter("[AgeGroupId] IS NOT NULL");
        builder.HasIndex(a => a.TeamId).IsUnique().HasFilter("[TeamId] IS NOT NULL");

        builder.HasOne(a => a.Framework)
            .WithMany()
            .HasForeignKey(a => a.FrameworkId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Club)
            .WithMany()
            .HasForeignKey(a => a.ClubId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.AgeGroup)
            .WithMany()
            .HasForeignKey(a => a.AgeGroupId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Team)
            .WithMany()
            .HasForeignKey(a => a.TeamId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
