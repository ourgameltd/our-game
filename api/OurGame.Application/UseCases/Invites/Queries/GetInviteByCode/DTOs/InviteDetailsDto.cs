using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Invites.Queries.GetInviteByCode.DTOs;

/// <summary>
/// Public-facing invite details DTO — does NOT expose internal entity IDs.
/// </summary>
public class InviteDetailsDto
{
    public string Code { get; set; } = string.Empty;
    public string MaskedEmail { get; set; } = string.Empty;
    public InviteType Type { get; set; }
    public string ClubName { get; set; } = string.Empty;
    public InviteStatus Status { get; set; }
    public DateTime ExpiresAt { get; set; }
}
