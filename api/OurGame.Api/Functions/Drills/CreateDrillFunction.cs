using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Drills.Commands.CreateDrill;
using OurGame.Application.UseCases.Drills.Commands.CreateDrill.DTOs;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Drills;

/// <summary>
/// Azure Function for creating a new drill
/// </summary>
public class CreateDrillFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<CreateDrillFunction> _logger;

    public CreateDrillFunction(IMediator mediator, ILogger<CreateDrillFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a new drill
    /// </summary>
    [Function("CreateDrill")]
    [OpenApiOperation(
        operationId: "CreateDrill",
        tags: new[] { "Drills" },
        Summary = "Create a new drill",
        Description = "Creates a new drill with attributes, equipment, instructions, variations, links, and scope assignment.")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreateDrillRequestDto),
        Required = true,
        Description = "Drill creation details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "Drill created successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "Referenced resource not found")]
    public async Task<HttpResponseData> CreateDrill(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/drills")] HttpRequestData req)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreateDrill");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<CreateDrillRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize CreateDrillRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreateDrillCommand(dto, userId);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Drill created successfully: {DrillId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            successResponse.Headers.Add("Location", $"/v1/drills/{result.Id}");
            await successResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateDrill");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateDrill");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating drill");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ErrorResponse(
                "An error occurred while creating the drill",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
