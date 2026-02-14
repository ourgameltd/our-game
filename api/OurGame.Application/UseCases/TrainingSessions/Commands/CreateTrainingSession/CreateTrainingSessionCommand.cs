using MediatR;
using OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession.DTOs;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById.DTOs;

namespace OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession;

/// <summary>
/// Command to create a new training session with drills, coaches, attendance, and applied templates
/// </summary>
public record CreateTrainingSessionCommand(CreateTrainingSessionDto Dto) : IRequest<TrainingSessionDetailDto>;
