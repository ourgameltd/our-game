using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class DevelopmentGoalConfiguration : IEntityTypeConfiguration<DevelopmentGoal>
{
    public void Configure(EntityTypeBuilder<DevelopmentGoal> builder)
    {
        builder.ToTable("DevelopmentGoals");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Plan)
            .WithMany(p => p.DevelopmentGoals)
            .HasForeignKey(e => e.PlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
