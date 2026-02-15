using MediatR;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerAbilityEvaluation.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;

namespace OurGame.Application.UseCases.Players.Commands.UpdatePlayerAbilityEvaluation;

/// <summary>
/// Command to update an existing player ability evaluation.
/// </summary>
public record UpdatePlayerAbilityEvaluationCommand(
    Guid PlayerId,
    Guid EvaluationId,
    string AzureUserId,
    UpdatePlayerAbilityEvaluationRequestDto Dto) : IRequest<PlayerAbilityEvaluationDto>;
