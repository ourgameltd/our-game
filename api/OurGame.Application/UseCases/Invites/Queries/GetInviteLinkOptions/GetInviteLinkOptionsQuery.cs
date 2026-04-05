using MediatR;
using OurGame.Application.UseCases.Invites.Queries.GetInviteLinkOptions.DTOs;

namespace OurGame.Application.UseCases.Invites.Queries.GetInviteLinkOptions;

public record GetInviteLinkOptionsQuery(string Code, string AuthId) : IRequest<InviteLinkOptionsDto>;
