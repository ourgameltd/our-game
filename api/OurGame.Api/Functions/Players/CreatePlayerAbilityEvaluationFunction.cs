using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.CreatePlayerAbilityEvaluation;
using OurGame.Application.UseCases.Players.Commands.CreatePlayerAbilityEvaluation.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for creating a new player ability evaluation
/// </summary>
public class CreatePlayerAbilityEvaluationFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<CreatePlayerAbilityEvaluationFunction> _logger;

    public CreatePlayerAbilityEvaluationFunction(IMediator mediator, ILogger<CreatePlayerAbilityEvaluationFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a new player ability evaluation
    /// </summary>
    [Function("CreatePlayerAbilityEvaluation")]
    [OpenApiOperation(
        operationId: "CreatePlayerAbilityEvaluation",
        tags: new[] { "Players" },
        Summary = "Create player ability evaluation",
        Description = "Creates a new ability evaluation for a player. Only coaches can create evaluations. The overall rating is computed as the average of all provided attribute ratings.")]
    [OpenApiParameter(
        name: "playerId",
        In = Microsoft.OpenApi.Models.ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The player ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreatePlayerAbilityEvaluationRequestDto),
        Required = true,
        Description = "Player ability evaluation details including attribute ratings")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerAbilityEvaluationDto>),
        Description = "Evaluation created successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerAbilityEvaluationDto>),
        Description = "Invalid request data or player ID format")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Forbidden,
        Description = "Forbidden - user is not a coach")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerAbilityEvaluationDto>),
        Description = "Player not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerAbilityEvaluationDto>),
        Description = "An unexpected error occurred")]
    public async Task<HttpResponseData> CreatePlayerAbilityEvaluation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/players/{playerId}/abilities/evaluations")] HttpRequestData req,
        string playerId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreatePlayerAbilityEvaluation");
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

        try
        {
            var request = await req.ReadFromJsonAsync<CreatePlayerAbilityEvaluationRequestDto>();
            if (request == null)
            {
                _logger.LogWarning("Failed to deserialize CreatePlayerAbilityEvaluationRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreatePlayerAbilityEvaluationCommand(playerGuid, userId, request);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Player ability evaluation created successfully: {EvaluationId} for player {PlayerId}", result.Id, playerGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            successResponse.Headers.Add("Location", $"/v1/players/{playerGuid}/abilities/evaluations/{result.Id}");
            await successResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (ForbiddenException ex)
        {
            _logger.LogWarning(ex, "Forbidden access attempt to CreatePlayerAbilityEvaluation by user {UserId}", userId);
            var forbiddenResponse = req.CreateResponse(HttpStatusCode.Forbidden);
            await forbiddenResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ErrorResponse(
                ex.Message,
                (int)HttpStatusCode.Forbidden));
            return forbiddenResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreatePlayerAbilityEvaluation");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreatePlayerAbilityEvaluation");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating player ability evaluation for player {PlayerId}", playerGuid);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilityEvaluationDto>.ErrorResponse(
                "An error occurred while creating the evaluation",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
