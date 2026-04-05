using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Invites.Commands.CreateInvite.DTOs;

public class CreateInviteRequestDto
{
    public string Email { get; set; } = string.Empty;
    public InviteType Type { get; set; }
    public Guid EntityId { get; set; }
    public Guid ClubId { get; set; }
    public bool IsOpenInvite { get; set; }
}
