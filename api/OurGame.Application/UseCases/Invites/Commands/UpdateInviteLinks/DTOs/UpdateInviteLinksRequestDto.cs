namespace OurGame.Application.UseCases.Invites.Commands.UpdateInviteLinks.DTOs;

public class UpdateInviteLinksRequestDto
{
    public List<Guid> SelectedEntityIds { get; set; } = new();
}
