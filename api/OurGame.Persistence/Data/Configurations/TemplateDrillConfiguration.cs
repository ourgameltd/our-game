using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class TemplateDrillConfiguration : IEntityTypeConfiguration<TemplateDrill>
{
    public void Configure(EntityTypeBuilder<TemplateDrill> builder)
    {
        builder.ToTable("template_drills");

        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.Template)
            .WithMany(t => t.TemplateDrills)
            .HasForeignKey(e => e.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Drill)
            .WithMany()
            .HasForeignKey(e => e.DrillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
