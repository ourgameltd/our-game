using MediatR;

namespace OurGame.Application.UseCases.Players.Commands.ArchivePlayerAbilityEvaluation;

/// <summary>
/// Command to archive or unarchive an existing player ability evaluation.
/// Archived evaluations are excluded from rating calculations.
/// </summary>
public record ArchivePlayerAbilityEvaluationCommand(
    Guid PlayerId,
    Guid EvaluationId,
    bool IsArchived,
    string AzureUserId) : IRequest;
