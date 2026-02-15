using MediatR;
using OurGame.Application.UseCases.Players.Commands.CreatePlayerAbilityEvaluation.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;

namespace OurGame.Application.UseCases.Players.Commands.CreatePlayerAbilityEvaluation;

/// <summary>
/// Command to create a new player ability evaluation.
/// </summary>
public record CreatePlayerAbilityEvaluationCommand(
    Guid PlayerId,
    string AzureUserId,
    CreatePlayerAbilityEvaluationRequestDto Dto) : IRequest<PlayerAbilityEvaluationDto>;
