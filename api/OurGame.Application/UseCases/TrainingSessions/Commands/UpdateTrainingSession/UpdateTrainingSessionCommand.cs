using MediatR;
using OurGame.Application.UseCases.TrainingSessions.Commands.UpdateTrainingSession.DTOs;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById.DTOs;

namespace OurGame.Application.UseCases.TrainingSessions.Commands.UpdateTrainingSession;

/// <summary>
/// Command to update an existing training session with all related data.
/// Nested collections (drills, coaches, attendance, applied templates) are replaced
/// entirely using a delete-and-reinsert strategy.
/// </summary>
/// <param name="SessionId">The unique identifier of the training session to update</param>
/// <param name="Dto">The updated training session data</param>
public record UpdateTrainingSessionCommand(Guid SessionId, UpdateTrainingSessionRequest Dto) : IRequest<TrainingSessionDetailDto>;
