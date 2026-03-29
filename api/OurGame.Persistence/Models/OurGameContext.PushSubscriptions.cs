using Microsoft.EntityFrameworkCore;

namespace OurGame.Persistence.Models;

public partial class OurGameContext
{
    public virtual DbSet<PushSubscription> PushSubscriptions { get; set; }
}
