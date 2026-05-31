#nullable disable
using System;
using System.Collections.Generic;

namespace OurGame.Persistence.Models;

public partial class Competency
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public int DisplayOrder { get; set; }

    public virtual ICollection<CompetencyAttribute> Attributes { get; set; } = new List<CompetencyAttribute>();
}
