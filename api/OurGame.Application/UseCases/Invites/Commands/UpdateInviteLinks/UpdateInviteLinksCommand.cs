using MediatR;
using OurGame.Application.UseCases.Invites.Commands.AcceptInvite.DTOs;
using OurGame.Application.UseCases.Invites.Commands.UpdateInviteLinks.DTOs;

namespace OurGame.Application.UseCases.Invites.Commands.UpdateInviteLinks;

public record UpdateInviteLinksCommand(
    string Code,
    string AuthId,
    string Email,
    string FirstName,
    string LastName,
    UpdateInviteLinksRequestDto Request) : IRequest<AcceptInviteResultDto>;
