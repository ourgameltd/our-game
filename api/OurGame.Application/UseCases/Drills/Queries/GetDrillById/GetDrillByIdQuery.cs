using MediatR;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;

namespace OurGame.Application.UseCases.Drills.Queries.GetDrillById;

/// <summary>
/// Query to retrieve full drill detail by ID
/// </summary>
/// <param name="DrillId">The unique identifier of the drill to retrieve</param>
public record GetDrillByIdQuery(Guid DrillId) : IRequest<DrillDetailDto?>;
