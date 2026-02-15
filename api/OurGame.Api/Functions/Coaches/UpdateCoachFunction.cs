using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Coaches.Commands.UpdateCoachById;
using OurGame.Application.UseCases.Coaches.Commands.UpdateCoachById.DTOs;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Coaches;

/// <summary>
/// Azure Function for updating an existing coach's settings
/// </summary>
public class UpdateCoachFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateCoachFunction> _logger;

    public UpdateCoachFunction(IMediator mediator, ILogger<UpdateCoachFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing coach's settings
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="coachId">The coach ID</param>
    /// <returns>The updated coach</returns>
    [Function("UpdateCoach")]
    [OpenApiOperation(
        operationId: "UpdateCoach",
        tags: new[] { "Coaches" },
        Summary = "Update coach settings",
        Description = "Updates an existing coach's personal details, contact information, certifications, and team assignments.")]
    [OpenApiParameter(
        name: "coachId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The coach identifier (UUID)")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateCoachRequestDto),
        Required = true,
        Description = "Updated coach details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<CoachDetailDto>),
        Description = "Coach updated successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.BadRequest,
        Description = "Invalid request data or validation failure")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NotFound,
        Description = "Coach not found")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    public async Task<HttpResponseData> UpdateCoach(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/coaches/{coachId}")] HttpRequestData req,
        string coachId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateCoach");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(coachId, out var coachGuid))
        {
            _logger.LogWarning("Invalid coachId format: {CoachId}", coachId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.ErrorResponse(
                "Invalid coach ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var dto = await req.ReadFromJsonAsync<UpdateCoachRequestDto>();
        if (dto == null)
        {
            _logger.LogWarning("Failed to deserialize UpdateCoachRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var command = new UpdateCoachCommand(coachGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Coach updated successfully: {CoachId}", coachGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateCoach");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateCoach");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
    }
}
