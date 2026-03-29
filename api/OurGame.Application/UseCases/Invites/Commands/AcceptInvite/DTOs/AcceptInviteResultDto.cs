namespace OurGame.Application.UseCases.Invites.Commands.AcceptInvite.DTOs;

public class AcceptInviteResultDto
{
    public Guid InviteId { get; set; }
    public string Message { get; set; } = string.Empty;
}
