using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class InjuryConfiguration : IEntityTypeConfiguration<Injury>
{
    public void Configure(EntityTypeBuilder<Injury> builder)
    {
        builder.Property(e => e.OpponentName).HasMaxLength(200);
    }
}
