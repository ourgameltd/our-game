namespace OurGame.Persistence.Models;

public partial class TacticPrinciple
{
    public virtual ICollection<TacticPrinciplePositionOverride> PositionOverrides { get; set; }
        = new List<TacticPrinciplePositionOverride>();
}
