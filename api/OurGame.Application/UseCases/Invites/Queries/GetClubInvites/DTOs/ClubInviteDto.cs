using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Invites.Queries.GetClubInvites.DTOs;

public class ClubInviteDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public InviteType Type { get; set; }
    public Guid EntityId { get; set; }
    public InviteStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public bool IsOpenInvite { get; set; }
}
