using MediatR;
using OurGame.Application.UseCases.Invites.Commands.AcceptInvite.DTOs;

namespace OurGame.Application.UseCases.Invites.Commands.AcceptInvite;

public record AcceptInviteCommand(
    string Code,
    string AuthId,
    string Email,
    string FirstName,
    string LastName) : IRequest<AcceptInviteResultDto>;
