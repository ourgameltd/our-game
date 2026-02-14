using OurGame.Application.Abstractions;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById.DTOs;

namespace OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById;

/// <summary>
/// Query to get a training session by ID with all related data including drills, attendance, coaches, and applied templates
/// </summary>
public record GetTrainingSessionByIdQuery(Guid Id) : IQuery<TrainingSessionDetailDto?>;
