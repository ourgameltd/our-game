using MediatR;
using OurGame.Application.UseCases.Coaches.Commands.UpdateCoachById.DTOs;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;

namespace OurGame.Application.UseCases.Coaches.Commands.UpdateCoachById;

/// <summary>
/// Command to update an existing coach's profile.
/// </summary>
public record UpdateCoachCommand(Guid CoachId, UpdateCoachRequestDto Dto) : IRequest<CoachDetailDto>;
