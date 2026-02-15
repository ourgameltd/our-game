using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerAbilityEvaluation;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerAbilityEvaluation.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for updating an existing player ability evaluation
/// </summary>
public class UpdatePlayerAbilityEvaluationFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdatePlayerAbilityEvaluationFunction> _logger;

    public UpdatePlayerAbilityEvaluationFunction(IMediator mediator, ILogger<UpdatePlayerAbilityEvaluationFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing player ability evaluation
    /// </summary>
    [Function("UpdatePlayerAbilityEvaluation")]
    [OpenApiOperation(
        operationId: "UpdatePlayerAbilityEvaluation",
        tags: new[] { "Players" },
        Summary = "Update player ability evaluation",
        Description = "Updates an existing ability evaluation for a player. Only the coach who created the evaluation can update it. The overall rating is recomputed as the average of all provided attribute ratings.")]
    [OpenApiParameter(
        name: "playerId",
        In = Microsoft.OpenApi.Models.ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The player ID")]
    [OpenApiParameter(
        name: "evaluationId",
        In = Microsoft.OpenApi.Models.ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The evaluation ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdatePlayerAbilityEvaluationRequestDto),
        Required = true,
        Description = "Updated player ability evaluation details including attribute ratings")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerAbilityEvaluationDto>),
        Description = "Evaluation updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerAbilityEvaluationDto>),
        Description = "Invalid request data or ID format")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Forbidden,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerAbilityEvaluationDto>),
        Description = "Forbidden - user is not the coach who created this evaluation")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerAbilityEvaluationDto>),
        Description = "Player or evaluation not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerAbilityEvaluationDto>),
        Description = "An unexpected error occurred")]
    public async Task<HttpResponseData> UpdatePlayerAbilityEvaluation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/players/{playerId}/abilities/evaluations/{evaluationId}")] HttpRequestData req,
        string playerId,
        string evaluationId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdatePlayerAbilityEvaluation");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            _logger.LogWarning("Invalid player ID format: {PlayerId}", playerId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ErrorResponse(
                "Invalid player ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        if (!Guid.TryParse(evaluationId, out var evaluationGuid))
        {
            _logger.LogWarning("Invalid evaluation ID format: {EvaluationId}", evaluationId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ErrorResponse(
                "Invalid evaluation ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var request = await req.ReadFromJsonAsync<UpdatePlayerAbilityEvaluationRequestDto>();
            if (request == null)
            {
                _logger.LogWarning("Failed to deserialize UpdatePlayerAbilityEvaluationRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdatePlayerAbilityEvaluationCommand(playerGuid, evaluationGuid, userId, request);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Player ability evaluation updated successfully: {EvaluationId} for player {PlayerId}", result.Id, playerGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (ForbiddenException ex)
        {
            _logger.LogWarning(ex, "Forbidden access attempt to UpdatePlayerAbilityEvaluation by user {UserId}", userId);
            var forbiddenResponse = req.CreateResponse(HttpStatusCode.Forbidden);
            await forbiddenResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ErrorResponse(
                ex.Message,
                (int)HttpStatusCode.Forbidden));
            return forbiddenResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdatePlayerAbilityEvaluation");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdatePlayerAbilityEvaluation");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating player ability evaluation for player {PlayerId}", playerGuid);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ErrorResponse(
                "An error occurred while updating the evaluation",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
