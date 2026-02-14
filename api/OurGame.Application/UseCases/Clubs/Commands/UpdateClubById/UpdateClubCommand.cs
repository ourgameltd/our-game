using MediatR;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubById.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;

namespace OurGame.Application.UseCases.Clubs.Commands.UpdateClubById;

/// <summary>
/// Command to update an existing club's details.
/// </summary>
public record UpdateClubCommand(Guid ClubId, UpdateClubRequestDto Dto) : IRequest<ClubDetailDto>;
