#nullable disable
using OurGame.Persistence.Enums;

namespace OurGame.Persistence.Models;

public partial class Invite
{
    public Guid Id { get; set; }

    public string Code { get; set; }

    public string Email { get; set; }

    public InviteType Type { get; set; }

    public Guid EntityId { get; set; }

    public Guid ClubId { get; set; }

    public InviteStatus Status { get; set; }

    public Guid? AcceptedByUserId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public DateTime? AcceptedAt { get; set; }

    public virtual Club Club { get; set; }

    public virtual User AcceptedByUser { get; set; }
}
