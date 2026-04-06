using OurGame.Persistence.Enums;

namespace OurGame.Application.UseCases.Invites.Queries.GetInviteLinkOptions.DTOs;

public class InviteLinkOptionsDto
{
    public string Code { get; set; } = string.Empty;
    public InviteType Type { get; set; }
    public bool CanSelectMultiple { get; set; }
    public bool HasSingleLinkAssigned { get; set; }
    public List<InviteLinkCandidateDto> Candidates { get; set; } = new();
}

public class InviteLinkCandidateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsLinked { get; set; }
    public bool IsLinkedToCurrentUser { get; set; }
}
