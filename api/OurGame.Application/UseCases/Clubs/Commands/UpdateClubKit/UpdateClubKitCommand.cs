using MediatR;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubKit.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId.DTOs;

namespace OurGame.Application.UseCases.Clubs.Commands.UpdateClubKit;

/// <summary>
/// Command to update an existing club kit.
/// </summary>
public record UpdateClubKitCommand(Guid ClubId, Guid KitId, UpdateClubKitRequestDto Dto) : IRequest<ClubKitDto>;