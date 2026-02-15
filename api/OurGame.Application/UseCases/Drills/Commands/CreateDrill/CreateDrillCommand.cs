using MediatR;
using OurGame.Application.UseCases.Drills.Commands.CreateDrill.DTOs;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;

namespace OurGame.Application.UseCases.Drills.Commands.CreateDrill;

/// <summary>
/// Command to create a new drill with scope assignment and links
/// </summary>
public record CreateDrillCommand(CreateDrillRequestDto Dto, string UserId) : IRequest<DrillDetailDto>;
