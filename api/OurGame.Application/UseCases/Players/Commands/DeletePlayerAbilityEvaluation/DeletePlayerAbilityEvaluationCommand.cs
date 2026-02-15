using MediatR;

namespace OurGame.Application.UseCases.Players.Commands.DeletePlayerAbilityEvaluation;

/// <summary>
/// Command to delete an existing player ability evaluation.
/// </summary>
public record DeletePlayerAbilityEvaluationCommand(
    Guid PlayerId,
    Guid EvaluationId,
    string AzureUserId) : IRequest;
