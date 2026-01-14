using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class SessionDrillConfiguration : IEntityTypeConfiguration<SessionDrill>
{
    public void Configure(EntityTypeBuilder<SessionDrill> builder)
    {
        builder.ToTable("session_drills");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Session)
            .WithMany(s => s.SessionDrills)
            .HasForeignKey(e => e.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Drill)
            .WithMany()
            .HasForeignKey(e => e.DrillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
