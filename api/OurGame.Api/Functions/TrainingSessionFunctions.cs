using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession;
using OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession.DTOs;
using OurGame.Application.UseCases.TrainingSessions.Commands.UpdateTrainingSession;
using OurGame.Application.UseCases.TrainingSessions.Commands.UpdateTrainingSession.DTOs;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Training Session endpoints
/// </summary>
public class TrainingSessionFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<TrainingSessionFunctions> _logger;

    public TrainingSessionFunctions(IMediator mediator, ILogger<TrainingSessionFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get a training session by ID with full detail
    /// </summary>
    [Function("GetTrainingSessionById")]
    [OpenApiOperation(
        operationId: "GetTrainingSessionById",
        tags: new[] { "Training Sessions" },
        Summary = "Get training session by ID",
        Description = "Retrieves full training session detail including drills, attendance, coaches, and applied templates")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The training session ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "Training session retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "Training session not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "Invalid training session ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetTrainingSessionById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/training-sessions/{id}")] HttpRequestData req,
        string id)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var sessionGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ErrorResponse(
                "Invalid training session ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var session = await _mediator.Send(new GetTrainingSessionByIdQuery(sessionGuid));

            if (session == null)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ErrorResponse(
                    "Training session not found", 404));
                return notFoundResponse;
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.SuccessResponse(session));
            return response;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Training session not found: {Id}", id);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during GetTrainingSessionById");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving training session: {Id}", id);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ErrorResponse(
                "An error occurred while retrieving the training session",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Create a new training session
    /// </summary>
    [Function("CreateTrainingSession")]
    [OpenApiOperation(
        operationId: "CreateTrainingSession",
        tags: new[] { "Training Sessions" },
        Summary = "Create a new training session",
        Description = "Creates a new training session with optional drills, coaches, attendance records, and applied templates.")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreateTrainingSessionDto),
        Required = true,
        Description = "Training session creation details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "Training session created successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "Referenced resource not found (team, drill, player, etc.)")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.InternalServerError,
        Description = "Internal server error")]
    public async Task<HttpResponseData> CreateTrainingSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/training-sessions")] HttpRequestData req)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreateTrainingSession");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<CreateTrainingSessionDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize CreateTrainingSessionDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreateTrainingSessionCommand(dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Training session created successfully: {SessionId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            successResponse.Headers.Add("Location", $"/api/v1/training-sessions/{result.Id}");
            await successResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateTrainingSession");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateTrainingSession");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating training session");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ErrorResponse(
                "An error occurred while creating the training session",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Update an existing training session
    /// </summary>
    [Function("UpdateTrainingSession")]
    [OpenApiOperation(
        operationId: "UpdateTrainingSession",
        tags: new[] { "Training Sessions" },
        Summary = "Update a training session",
        Description = "Updates an existing training session. Drills, coaches, attendance, and applied templates are replaced entirely.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The training session ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateTrainingSessionRequest),
        Required = true,
        Description = "Updated training session details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "Training session updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TrainingSessionDetailDto>),
        Description = "Training session not found")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.InternalServerError,
        Description = "Internal server error")]
    public async Task<HttpResponseData> UpdateTrainingSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/training-sessions/{id}")] HttpRequestData req,
        string id)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateTrainingSession");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var sessionGuid))
        {
            _logger.LogWarning("Invalid training session ID format: {Id}", id);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ErrorResponse(
                "Invalid training session ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateTrainingSessionRequest>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateTrainingSessionRequest");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdateTrainingSessionCommand(sessionGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Training session updated successfully: {SessionId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateTrainingSession");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateTrainingSession");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating training session");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TrainingSessionDetailDto>.ErrorResponse(
                "An error occurred while updating the training session",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
