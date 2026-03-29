using MediatR;
using OurGame.Application.UseCases.Invites.Queries.GetInviteByCode.DTOs;

namespace OurGame.Application.UseCases.Invites.Queries.GetInviteByCode;

public record GetInviteByCodeQuery(string Code) : IRequest<InviteDetailsDto>;
