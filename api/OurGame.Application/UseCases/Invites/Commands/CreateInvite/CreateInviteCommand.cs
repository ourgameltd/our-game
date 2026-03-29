using MediatR;
using OurGame.Application.UseCases.Invites.Commands.CreateInvite.DTOs;

namespace OurGame.Application.UseCases.Invites.Commands.CreateInvite;

public record CreateInviteCommand(string AuthId, CreateInviteRequestDto Request) : IRequest<InviteDto>;
