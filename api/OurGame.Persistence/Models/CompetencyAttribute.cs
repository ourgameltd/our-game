#nullable disable
using System;
using System.Collections.Generic;

namespace OurGame.Persistence.Models;

/// <summary>
/// One of the 35 fixed attributes in the competency framework taxonomy. Each attribute
/// is owned by a single category and driven by a single competency.
/// </summary>
public partial class CompetencyAttribute
{
    public Guid Id { get; set; }

    public Guid CategoryId { get; set; }

    public Guid CompetencyId { get; set; }

    public string Name { get; set; }

    /// <summary>Goalkeeper-equivalent display name for the same attribute (1-to-1 mapping).</summary>
    public string GoalkeeperName { get; set; }

    public int DisplayOrder { get; set; }

    public virtual CompetencyCategory Category { get; set; }

    public virtual Competency Competency { get; set; }
}
