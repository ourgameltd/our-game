using System;

namespace OurGame.Persistence.Models;

public partial class TacticPrinciplePositionOverride
{
    public Guid Id { get; set; }

    public Guid TacticPrincipleId { get; set; }

    public int PositionIndex { get; set; }

    public decimal? XCoord { get; set; }

    public decimal? YCoord { get; set; }

    public string? Direction { get; set; }

    public virtual TacticPrinciple TacticPrinciple { get; set; } = null!;
}
