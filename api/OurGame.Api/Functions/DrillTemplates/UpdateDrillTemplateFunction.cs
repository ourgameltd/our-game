using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DrillTemplates.Commands.UpdateDrillTemplate;
using OurGame.Application.UseCases.DrillTemplates.Commands.UpdateDrillTemplate.DTOs;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.DrillTemplates;

/// <summary>
/// Azure Function for updating an existing drill template
/// </summary>
public class UpdateDrillTemplateFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateDrillTemplateFunction> _logger;

    public UpdateDrillTemplateFunction(IMediator mediator, ILogger<UpdateDrillTemplateFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing drill template
    /// </summary>
    [Function("UpdateDrillTemplate")]
    [OpenApiOperation(
        operationId: "UpdateDrillTemplate",
        tags: new[] { "DrillTemplates" },
        Summary = "Update a drill template",
        Description = "Updates an existing drill template. TemplateDrills are replaced entirely. Scope cannot be changed. Only the creating coach can update the template.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The drill template ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateDrillTemplateRequestDto),
        Required = true,
        Description = "Updated drill template details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateDetailDto>),
        Description = "Drill template updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Forbidden,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateDetailDto>),
        Description = "User not authorized to update this drill template")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateDetailDto>),
        Description = "Drill template not found")]
    public async Task<HttpResponseData> UpdateDrillTemplate(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/drill-templates/{id}")] HttpRequestData req,
        string id)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateDrillTemplate");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var templateGuid))
        {
            _logger.LogWarning("Invalid drill template ID format: {Id}", id);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.ErrorResponse(
                "Invalid drill template ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateDrillTemplateRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateDrillTemplateRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdateDrillTemplateCommand(templateGuid, userId, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Drill template updated successfully: {TemplateId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized attempt to update drill template: {TemplateId}", templateGuid);
            var forbiddenResponse = req.CreateResponse(HttpStatusCode.Forbidden);
            await forbiddenResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.ErrorResponse(
                ex.Message,
                (int)HttpStatusCode.Forbidden));
            return forbiddenResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateDrillTemplate");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateDrillTemplate");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating drill template");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.ErrorResponse(
                "An error occurred while updating the drill template",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
