using MediatR;
using OurGame.Application.UseCases.Clubs.Commands.CreateClubKit.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId.DTOs;

namespace OurGame.Application.UseCases.Clubs.Commands.CreateClubKit;

/// <summary>
/// Command to create a new club kit.
/// </summary>
public record CreateClubKitCommand(Guid ClubId, CreateClubKitRequestDto Dto) : IRequest<ClubKitDto>;