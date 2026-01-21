using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OurGame.Persistence.Models;

namespace OurGame.Persistence.Data.Configurations;

public class PlayerAttributeConfiguration : IEntityTypeConfiguration<PlayerAttribute>
{
    public void Configure(EntityTypeBuilder<PlayerAttribute> builder)
    {
        builder.ToTable("PlayerAttributes");
        builder.HasKey(pa => pa.Id);
    }
}
