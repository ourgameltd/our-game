using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DrillTemplates.Commands.CreateDrillTemplate;
using OurGame.Application.UseCases.DrillTemplates.Commands.CreateDrillTemplate.DTOs;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope.DTOs;
using System.Net;

namespace OurGame.Api.Functions.DrillTemplates;

/// <summary>
/// Azure Function for creating a new drill template
/// </summary>
public class CreateDrillTemplateFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<CreateDrillTemplateFunction> _logger;

    public CreateDrillTemplateFunction(IMediator mediator, ILogger<CreateDrillTemplateFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a new drill template
    /// </summary>
    [Function("CreateDrillTemplate")]
    [OpenApiOperation(
        operationId: "CreateDrillTemplate",
        tags: new[] { "DrillTemplates" },
        Summary = "Create a new drill template",
        Description = "Creates a new drill template with drills in order and scope assignment. Computes total duration, aggregated attributes, and category.")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreateDrillTemplateRequestDto),
        Required = true,
        Description = "Drill template creation details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateListDto>),
        Description = "Drill template created successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateListDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateListDto>),
        Description = "Referenced resource not found")]
    public async Task<HttpResponseData> CreateDrillTemplate(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/drill-templates")] HttpRequestData req)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreateDrillTemplate");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateListDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<CreateDrillTemplateRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize CreateDrillTemplateRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateListDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreateDrillTemplateCommand(dto, userId);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Drill template created successfully: {TemplateId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            successResponse.Headers.Add("Location", $"/v1/drill-templates/{result.Id}");
            await successResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateListDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateDrillTemplate");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateListDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateDrillTemplate");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateListDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating drill template");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateListDto>.ErrorResponse(
                "An error occurred while creating the drill template",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
