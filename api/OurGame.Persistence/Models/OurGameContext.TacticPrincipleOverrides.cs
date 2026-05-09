using Microsoft.EntityFrameworkCore;

namespace OurGame.Persistence.Models;

public partial class OurGameContext
{
    public virtual DbSet<TacticPrinciplePositionOverride> TacticPrinciplePositionOverrides { get; set; }
}
