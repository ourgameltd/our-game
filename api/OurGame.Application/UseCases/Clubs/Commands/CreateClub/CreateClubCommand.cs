using MediatR;
using OurGame.Application.UseCases.Clubs.Commands.CreateClub.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;

namespace OurGame.Application.UseCases.Clubs.Commands.CreateClub;

public record CreateClubCommand(CreateClubRequestDto Dto) : IRequest<ClubDetailDto>;
