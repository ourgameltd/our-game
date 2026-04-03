using System;

namespace OurGame.Persistence.Models;

public partial class ClubMediaLink
{
    public Guid Id { get; set; }

    public Guid ClubId { get; set; }

    public string Url { get; set; } = string.Empty;

    public string? Title { get; set; }

    public string Type { get; set; } = "other";

    public bool IsPublic { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Club Club { get; set; } = null!;
}
