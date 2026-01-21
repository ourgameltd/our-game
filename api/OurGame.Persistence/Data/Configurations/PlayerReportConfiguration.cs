using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerReportConfiguration : IEntityTypeConfiguration<PlayerReport>
{
    public void Configure(EntityTypeBuilder<PlayerReport> builder)
    {
        builder.ToTable("PlayerReports");
        builder.HasKey(p => p.Id);

        // Seed data
    }
}
