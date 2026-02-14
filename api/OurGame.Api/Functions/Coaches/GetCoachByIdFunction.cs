using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Coaches;

/// <summary>
/// Azure Function for getting a coach profile by ID
/// </summary>
public class GetCoachByIdFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetCoachByIdFunction> _logger;

    public GetCoachByIdFunction(IMediator mediator, ILogger<GetCoachByIdFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get a coach by ID with full profile detail
    /// </summary>
    [Function("GetCoachById")]
    [OpenApiOperation(
        operationId: "GetCoachById",
        tags: new[] { "Coaches" },
        Summary = "Get coach by ID",
        Description = "Retrieves full coach profile including contact info, team assignments, and coordinator roles")]
    [OpenApiParameter(
        name: "coachId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The coach ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<CoachDetailDto>),
        Description = "Coach retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<CoachDetailDto>),
        Description = "Invalid coach ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<CoachDetailDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<CoachDetailDto>),
        Description = "Coach not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<CoachDetailDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetCoachById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/coaches/{coachId}")] HttpRequestData req,
        string coachId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            _logger.LogWarning("Unauthorized access attempt to GetCoachById");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.ErrorResponse(
                "Authentication required", (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(coachId, out var coachGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.ErrorResponse(
                "Invalid coach ID format", (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var coach = await _mediator.Send(new GetCoachByIdQuery(coachGuid));

        if (coach == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.NotFoundResponse(
                "Coach not found"));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<CoachDetailDto>.SuccessResponse(coach));
        return response;
    }
}
