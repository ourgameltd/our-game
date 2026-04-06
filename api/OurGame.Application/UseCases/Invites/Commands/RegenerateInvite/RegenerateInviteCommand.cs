using MediatR;
using OurGame.Application.UseCases.Invites.Commands.CreateInvite.DTOs;

namespace OurGame.Application.UseCases.Invites.Commands.RegenerateInvite;

public record RegenerateInviteCommand(Guid InviteId, string AuthId) : IRequest<InviteDto>;
