using MediatR;
using OurGame.Application.UseCases.Invites.Queries.GetClubInvites.DTOs;

namespace OurGame.Application.UseCases.Invites.Queries.GetClubInvites;

public record GetClubInvitesQuery(Guid ClubId, string AuthId) : IRequest<List<ClubInviteDto>>;
