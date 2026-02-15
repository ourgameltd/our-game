using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.DevelopmentPlans;

/// <summary>
/// Azure Function for getting a development plan by ID
/// </summary>
public class GetDevelopmentPlanByIdFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetDevelopmentPlanByIdFunction> _logger;

    public GetDevelopmentPlanByIdFunction(IMediator mediator, ILogger<GetDevelopmentPlanByIdFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get a development plan by ID with full detail
    /// </summary>
    [Function("GetDevelopmentPlanById")]
    [OpenApiOperation(
        operationId: "GetDevelopmentPlanById",
        tags: new[] { "DevelopmentPlans" },
        Summary = "Get development plan by ID",
        Description = "Retrieves a development plan with all its goals and progress tracking")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The development plan ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDetailDto>),
        Description = "Development plan retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDetailDto>),
        Description = "Invalid development plan ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDetailDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDetailDto>),
        Description = "Development plan not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDetailDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetDevelopmentPlanById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/development-plans/{id}")] HttpRequestData req,
        string id)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            _logger.LogWarning("Unauthorized access attempt to GetDevelopmentPlanById");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDetailDto>.ErrorResponse(
                "Authentication required", (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var planGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDetailDto>.ErrorResponse(
                "Invalid development plan ID format", (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var plan = await _mediator.Send(new GetDevelopmentPlanByIdQuery(planGuid));

        if (plan == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDetailDto>.NotFoundResponse(
                "Development plan not found"));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDetailDto>.SuccessResponse(plan));
        return response;
    }
}
