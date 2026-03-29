using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Invites.Commands.CreateInvite.DTOs;

public class InviteDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public InviteType Type { get; set; }
    public Guid EntityId { get; set; }
    public Guid ClubId { get; set; }
    public string ClubName { get; set; } = string.Empty;
    public InviteStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
