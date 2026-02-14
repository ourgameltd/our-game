using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.CreateDevelopmentPlan;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.CreateDevelopmentPlan.DTOs;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.UpdateDevelopmentPlan;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.UpdateDevelopmentPlan.DTOs;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Development Plan endpoints
/// </summary>
public class DevelopmentPlanFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<DevelopmentPlanFunctions> _logger;

    public DevelopmentPlanFunctions(IMediator mediator, ILogger<DevelopmentPlanFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get a development plan by ID
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="id">The development plan ID</param>
    /// <returns>Development plan with goals</returns>
    [Function("GetDevelopmentPlanById")]
    [OpenApiOperation(
        operationId: "GetDevelopmentPlanById",
        tags: new[] { "DevelopmentPlans" },
        Summary = "Get development plan by ID",
        Description = "Retrieves a development plan with all its goals")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The development plan ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "Development plan retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "Development plan not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "Invalid development plan ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetDevelopmentPlanById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/development-plans/{id}")] HttpRequestData req,
        string id)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var planGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ErrorResponse(
                "Invalid development plan ID format", 400));
            return badRequestResponse;
        }

        var plan = await _mediator.Send(new GetDevelopmentPlanByIdQuery(planGuid));

        if (plan == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ErrorResponse(
                "Development plan not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.SuccessResponse(plan));
        return response;
    }

    /// <summary>
    /// Create a new development plan
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>The created development plan</returns>
    [Function("CreateDevelopmentPlan")]
    [OpenApiOperation(
        operationId: "CreateDevelopmentPlan",
        tags: new[] { "DevelopmentPlans" },
        Summary = "Create a new development plan",
        Description = "Creates a new development plan with goals for a player.")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreateDevelopmentPlanRequest),
        Required = true,
        Description = "Development plan details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "Development plan created successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "Player not found")]
    public async Task<HttpResponseData> CreateDevelopmentPlan(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/development-plans")] HttpRequestData req)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreateDevelopmentPlan");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<CreateDevelopmentPlanRequest>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize CreateDevelopmentPlanRequest");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreateDevelopmentPlanCommand(dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Development plan created successfully: {PlanId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            await successResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateDevelopmentPlan");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateDevelopmentPlan");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating development plan");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ErrorResponse(
                "An error occurred while creating the development plan",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Update an existing development plan
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="id">The development plan ID</param>
    /// <returns>The updated development plan</returns>
    [Function("UpdateDevelopmentPlan")]
    [OpenApiOperation(
        operationId: "UpdateDevelopmentPlan",
        tags: new[] { "DevelopmentPlans" },
        Summary = "Update a development plan",
        Description = "Updates an existing development plan. Goals are replaced entirely.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(string),
        Description = "The development plan ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateDevelopmentPlanRequest),
        Required = true,
        Description = "Updated development plan details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "Development plan updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DevelopmentPlanDto>),
        Description = "Development plan not found")]
    public async Task<HttpResponseData> UpdateDevelopmentPlan(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/development-plans/{id}")] HttpRequestData req,
        string id)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateDevelopmentPlan");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var planGuid))
        {
            _logger.LogWarning("Invalid development plan ID format: {Id}", id);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ErrorResponse(
                "Invalid development plan ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateDevelopmentPlanRequest>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateDevelopmentPlanRequest");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdateDevelopmentPlanCommand(planGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Development plan updated successfully: {PlanId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateDevelopmentPlan");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateDevelopmentPlan");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating development plan");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<DevelopmentPlanDto>.ErrorResponse(
                "An error occurred while updating the development plan",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
