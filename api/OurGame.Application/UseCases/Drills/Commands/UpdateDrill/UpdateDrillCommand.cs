using MediatR;
using OurGame.Application.UseCases.Drills.Commands.UpdateDrill.DTOs;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;

namespace OurGame.Application.UseCases.Drills.Commands.UpdateDrill;

/// <summary>
/// Command to update an existing drill (replace strategy for links)
/// </summary>
public record UpdateDrillCommand(Guid DrillId, string UserId, UpdateDrillRequestDto Dto) : IRequest<DrillDetailDto>;
