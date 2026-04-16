using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DrillTemplates.Commands.ArchiveDrillTemplate;
using OurGame.Application.UseCases.DrillTemplates.Commands.ArchiveDrillTemplate.DTOs;
using System.Net;

namespace OurGame.Api.Functions.DrillTemplates;

/// <summary>
/// Azure Function for archiving/unarchiving drill templates.
/// </summary>
public class ArchiveDrillTemplateFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<ArchiveDrillTemplateFunction> _logger;

    public ArchiveDrillTemplateFunction(IMediator mediator, ILogger<ArchiveDrillTemplateFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Archive or unarchive a drill template.
    /// </summary>
    [Function("ArchiveDrillTemplate")]
    [OpenApiOperation(
        operationId: "ArchiveDrillTemplate",
        tags: new[] { "DrillTemplates" },
        Summary = "Archive/unarchive a drill template",
        Description = "Archives or unarchives an existing drill template. Only the creating coach can archive/unarchive the template.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The drill template ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(ArchiveDrillTemplateRequestDto),
        Required = true,
        Description = "Archive status payload")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NoContent,
        Description = "Drill template archive status updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Forbidden,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "User not authorized to archive this drill template")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Drill template not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "An unexpected error occurred")]
    public async Task<HttpResponseData> ArchiveDrillTemplate(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/drill-templates/{id}/archive")] HttpRequestData req,
        string id)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to ArchiveDrillTemplate");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var templateGuid))
        {
            _logger.LogWarning("Invalid drill template ID format: {Id}", id);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid drill template ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<ArchiveDrillTemplateRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize ArchiveDrillTemplateRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            await _mediator.Send(new ArchiveDrillTemplateCommand(templateGuid, userId, dto));

            _logger.LogInformation("Drill template archive status updated: {TemplateId} - IsArchived: {IsArchived}", templateGuid, dto.IsArchived);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized attempt to archive drill template: {TemplateId}", templateGuid);
            var forbiddenResponse = req.CreateResponse(HttpStatusCode.Forbidden);
            await forbiddenResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                ex.Message,
                (int)HttpStatusCode.Forbidden));
            return forbiddenResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Drill template not found: {TemplateId}", templateGuid);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving drill template: {TemplateId}", templateGuid);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while updating drill template archive status",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
