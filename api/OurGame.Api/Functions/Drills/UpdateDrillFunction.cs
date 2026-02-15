using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Drills.Commands.UpdateDrill;
using OurGame.Application.UseCases.Drills.Commands.UpdateDrill.DTOs;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Drills;

/// <summary>
/// Azure Function for updating an existing drill
/// </summary>
public class UpdateDrillFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateDrillFunction> _logger;

    public UpdateDrillFunction(IMediator mediator, ILogger<UpdateDrillFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing drill
    /// </summary>
    [Function("UpdateDrill")]
    [OpenApiOperation(
        operationId: "UpdateDrill",
        tags: new[] { "Drills" },
        Summary = "Update a drill",
        Description = "Updates an existing drill. DrillLinks are replaced entirely. Scope cannot be changed. Only the creating coach can update the drill.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The drill ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateDrillRequestDto),
        Required = true,
        Description = "Updated drill details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "Drill updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Forbidden,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "User not authorized to update this drill")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "Drill not found")]
    public async Task<HttpResponseData> UpdateDrill(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/drills/{id}")] HttpRequestData req,
        string id)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateDrill");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var drillGuid))
        {
            _logger.LogWarning("Invalid drill ID format: {Id}", id);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ErrorResponse(
                "Invalid drill ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateDrillRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateDrillRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdateDrillCommand(drillGuid, userId, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Drill updated successfully: {DrillId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized attempt to update drill: {DrillId}", drillGuid);
            var forbiddenResponse = req.CreateResponse(HttpStatusCode.Forbidden);
            await forbiddenResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ErrorResponse(
                ex.Message,
                (int)HttpStatusCode.Forbidden));
            return forbiddenResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateDrill");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateDrill");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating drill");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ErrorResponse(
                "An error occurred while updating the drill",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
