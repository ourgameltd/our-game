using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Drills.Commands.ArchiveDrill;
using OurGame.Application.UseCases.Drills.Commands.ArchiveDrill.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Drills;

/// <summary>
/// Azure Function for archiving/unarchiving drills.
/// </summary>
public class ArchiveDrillFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<ArchiveDrillFunction> _logger;

    public ArchiveDrillFunction(IMediator mediator, ILogger<ArchiveDrillFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Archive or unarchive a drill.
    /// </summary>
    [Function("ArchiveDrill")]
    [OpenApiOperation(
        operationId: "ArchiveDrill",
        tags: new[] { "Drills" },
        Summary = "Archive/unarchive a drill",
        Description = "Archives or unarchives an existing drill. Only the creating coach can archive/unarchive the drill.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The drill ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(ArchiveDrillRequestDto),
        Required = true,
        Description = "Archive status payload")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NoContent,
        Description = "Drill archive status updated successfully")]
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
        Description = "User not authorized to archive this drill")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Drill not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "An unexpected error occurred")]
    public async Task<HttpResponseData> ArchiveDrill(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/drills/{id}/archive")] HttpRequestData req,
        string id)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to ArchiveDrill");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var drillGuid))
        {
            _logger.LogWarning("Invalid drill ID format: {Id}", id);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid drill ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<ArchiveDrillRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize ArchiveDrillRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            await _mediator.Send(new ArchiveDrillCommand(drillGuid, userId, dto));

            _logger.LogInformation("Drill archive status updated: {DrillId} - IsArchived: {IsArchived}", drillGuid, dto.IsArchived);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized attempt to archive drill: {DrillId}", drillGuid);
            var forbiddenResponse = req.CreateResponse(HttpStatusCode.Forbidden);
            await forbiddenResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                ex.Message,
                (int)HttpStatusCode.Forbidden));
            return forbiddenResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Drill not found: {DrillId}", drillGuid);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving drill: {DrillId}", drillGuid);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while updating drill archive status",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
