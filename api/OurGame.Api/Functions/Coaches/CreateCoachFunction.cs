using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Coaches.Commands.CreateCoach;
using OurGame.Application.UseCases.Coaches.Commands.CreateCoach.DTOs;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Coaches;

public class CreateCoachFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<CreateCoachFunction> _logger;

    public CreateCoachFunction(IMediator mediator, ILogger<CreateCoachFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Function("CreateCoach")]
    [OpenApiOperation(
        operationId: "CreateCoach",
        tags: new[] { "Coaches" },
        Summary = "Create a new coach",
        Description = "Creates a new coach for the specified club.")]
    [OpenApiParameter(
        name: "clubId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The club identifier (UUID)")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreateCoachRequestDto),
        Required = true,
        Description = "New coach details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<CoachDetailDto>),
        Description = "Coach created successfully")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.BadRequest, Description = "Invalid request data or validation failure")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Club not found")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    public async Task<HttpResponseData> CreateCoach(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/clubs/{clubId}/coaches")] HttpRequestData req,
        string clubId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreateCoach");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            _logger.LogWarning("Invalid clubId format: {ClubId}", clubId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.ErrorResponse(
                "Invalid club ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var dto = await req.ReadFromJsonAsync<CreateCoachRequestDto>();
        if (dto == null)
        {
            _logger.LogWarning("Failed to deserialize CreateCoachRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var command = new CreateCoachCommand(clubGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Coach created successfully: {CoachId} for club {ClubId}", result.Id, clubGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            await successResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateCoach");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateCoach");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
    }
}
