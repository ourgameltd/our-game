using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.DeletePlayerAbilityEvaluation;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for deleting an existing player ability evaluation
/// </summary>
public class DeletePlayerAbilityEvaluationFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<DeletePlayerAbilityEvaluationFunction> _logger;

    public DeletePlayerAbilityEvaluationFunction(IMediator mediator, ILogger<DeletePlayerAbilityEvaluationFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Delete an existing player ability evaluation
    /// </summary>
    [Function("DeletePlayerAbilityEvaluation")]
    [OpenApiOperation(
        operationId: "DeletePlayerAbilityEvaluation",
        tags: new[] { "Players" },
        Summary = "Delete player ability evaluation",
        Description = "Deletes an existing ability evaluation for a player. Only the coach who created the evaluation can delete it.")]
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
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NoContent,
        Description = "Evaluation deleted successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Invalid ID format")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Forbidden,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Forbidden - user is not the coach who created this evaluation")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Player or evaluation not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "An unexpected error occurred")]
    public async Task<HttpResponseData> DeletePlayerAbilityEvaluation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "v1/players/{playerId}/abilities/evaluations/{evaluationId}")] HttpRequestData req,
        string playerId,
        string evaluationId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to DeletePlayerAbilityEvaluation");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            _logger.LogWarning("Invalid player ID format: {PlayerId}", playerId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid player ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        if (!Guid.TryParse(evaluationId, out var evaluationGuid))
        {
            _logger.LogWarning("Invalid evaluation ID format: {EvaluationId}", evaluationId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid evaluation ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var command = new DeletePlayerAbilityEvaluationCommand(playerGuid, evaluationGuid, userId);
            await _mediator.Send(command);

            _logger.LogInformation("Player ability evaluation deleted successfully: {EvaluationId} for player {PlayerId}", evaluationGuid, playerGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.NoContent);
            return successResponse;
        }
        catch (ForbiddenException ex)
        {
            _logger.LogWarning(ex, "Forbidden access attempt to DeletePlayerAbilityEvaluation by user {UserId}", userId);
            var forbiddenResponse = req.CreateResponse(HttpStatusCode.Forbidden);
            await forbiddenResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                ex.Message,
                (int)HttpStatusCode.Forbidden));
            return forbiddenResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during DeletePlayerAbilityEvaluation");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting player ability evaluation for player {PlayerId}", playerGuid);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while deleting the evaluation",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
