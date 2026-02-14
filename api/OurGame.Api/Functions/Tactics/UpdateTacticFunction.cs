using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Tactics.Commands.UpdateTactic;
using OurGame.Application.UseCases.Tactics.Commands.UpdateTactic.DTOs;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Tactics;

/// <summary>
/// Azure Function for updating an existing tactic
/// </summary>
public class UpdateTacticFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateTacticFunction> _logger;

    public UpdateTacticFunction(IMediator mediator, ILogger<UpdateTacticFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing tactic
    /// </summary>
    [Function("UpdateTactic")]
    [OpenApiOperation(
        operationId: "UpdateTactic",
        tags: new[] { "Tactics" },
        Summary = "Update a tactic",
        Description = "Updates an existing tactic. Position overrides and principles are replaced entirely. ParentFormationId and scope cannot be changed.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The tactic ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateTacticRequestDto),
        Required = true,
        Description = "Updated tactic details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "Tactic updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "Tactic not found")]
    public async Task<HttpResponseData> UpdateTactic(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/tactics/{id}")] HttpRequestData req,
        string id)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateTactic");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var tacticGuid))
        {
            _logger.LogWarning("Invalid tactic ID format: {Id}", id);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.ErrorResponse(
                "Invalid tactic ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateTacticRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateTacticRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdateTacticCommand(tacticGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Tactic updated successfully: {TacticId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateTactic");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateTactic");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tactic");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.ErrorResponse(
                "An error occurred while updating the tactic",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
