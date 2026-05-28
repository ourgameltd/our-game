using MediatR;
using OurGame.Application.UseCases.Coaches.Commands.CreateCoach.DTOs;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;

namespace OurGame.Application.UseCases.Coaches.Commands.CreateCoach;

public record CreateCoachCommand(Guid ClubId, CreateCoachRequestDto Dto) : IRequest<CoachDetailDto>;
