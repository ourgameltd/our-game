using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.ArchivePlayerAbilityEvaluation;
using OurGame.Application.UseCases.Players.Commands.ArchivePlayerAbilityEvaluation.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for archiving or unarchiving an existing player ability evaluation.
/// </summary>
public class ArchivePlayerAbilityEvaluationFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<ArchivePlayerAbilityEvaluationFunction> _logger;

    public ArchivePlayerAbilityEvaluationFunction(IMediator mediator, ILogger<ArchivePlayerAbilityEvaluationFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Archive or unarchive an existing player ability evaluation.
    /// Archived evaluations are excluded from rating calculations on the client.
    /// </summary>
    [Function("ArchivePlayerAbilityEvaluation")]
    [OpenApiOperation(
        operationId: "ArchivePlayerAbilityEvaluation",
        tags: new[] { "Players" },
        Summary = "Archive or unarchive player ability evaluation",
        Description = "Toggles the archived state of an existing ability evaluation for a player. Archived evaluations are excluded from rating calculations.")]
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
        bodyType: typeof(ArchivePlayerAbilityEvaluationRequestDto),
        Required = true,
        Description = "Archive flag payload")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NoContent,
        Description = "Evaluation archive state updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Invalid ID format or request body")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
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
    public async Task<HttpResponseData> ArchivePlayerAbilityEvaluation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "v1/players/{playerId}/abilities/evaluations/{evaluationId}/archive")] HttpRequestData req,
        string playerId,
        string evaluationId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to ArchivePlayerAbilityEvaluation");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid player ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        if (!Guid.TryParse(evaluationId, out var evaluationGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid evaluation ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        ArchivePlayerAbilityEvaluationRequestDto? dto;
        try
        {
            dto = await req.ReadFromJsonAsync<ArchivePlayerAbilityEvaluationRequestDto>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to deserialize archive request body");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        if (dto == null)
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Request body is required",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var command = new ArchivePlayerAbilityEvaluationCommand(playerGuid, evaluationGuid, dto.IsArchived, userId);
            await _mediator.Send(command);

            _logger.LogInformation(
                "Player ability evaluation archive state set to {IsArchived}: {EvaluationId} for player {PlayerId}",
                dto.IsArchived,
                evaluationGuid,
                playerGuid);

            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during ArchivePlayerAbilityEvaluation");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating archive state for player ability evaluation {EvaluationId}", evaluationGuid);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while updating the evaluation",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
