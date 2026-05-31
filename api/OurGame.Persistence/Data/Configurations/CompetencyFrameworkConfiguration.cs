using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class CompetencyFrameworkConfiguration : IEntityTypeConfiguration<CompetencyFramework>
{
    public void Configure(EntityTypeBuilder<CompetencyFramework> builder)
    {
        builder.ToTable("CompetencyFrameworks");
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Name).HasMaxLength(128).IsRequired();
        builder.Property(f => f.Description).HasMaxLength(1024);
        builder.Property(f => f.UpliftPercent).HasPrecision(5, 2);
        builder.Property(f => f.Scope).HasConversion<int>();

        builder.HasIndex(f => new { f.Scope, f.OwnerClubId, f.OwnerAgeGroupId, f.OwnerTeamId });

        builder.HasOne(f => f.SourceFramework)
            .WithMany()
            .HasForeignKey(f => f.SourceFrameworkId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.OwnerClub)
            .WithMany()
            .HasForeignKey(f => f.OwnerClubId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.OwnerAgeGroup)
            .WithMany()
            .HasForeignKey(f => f.OwnerAgeGroupId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.OwnerTeam)
            .WithMany()
            .HasForeignKey(f => f.OwnerTeamId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
