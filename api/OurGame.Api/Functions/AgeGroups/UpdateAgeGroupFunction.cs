using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.AgeGroups.Commands.UpdateAgeGroup;
using OurGame.Application.UseCases.AgeGroups.Commands.UpdateAgeGroup.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.AgeGroups;

/// <summary>
/// Azure Function for updating an existing age group
/// </summary>
public class UpdateAgeGroupFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateAgeGroupFunction> _logger;

    public UpdateAgeGroupFunction(IMediator mediator, ILogger<UpdateAgeGroupFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing age group
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>The updated age group</returns>
    [Function("UpdateAgeGroup")]
    [OpenApiOperation(
        operationId: "UpdateAgeGroup",
        tags: new[] { "AgeGroups" },
        Summary = "Update an age group",
        Description = "Updates an existing age group with the provided details. Supports multi-season assignment.")]
    [OpenApiParameter(
        name: "ageGroupId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The age group identifier")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateAgeGroupRequestDto),
        Required = true,
        Description = "Updated age group details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<AgeGroupDetailDto>),
        Description = "Age group updated successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.BadRequest,
        Description = "Invalid request data or validation failure")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NotFound,
        Description = "Age group or club not found")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    public async Task<HttpResponseData> UpdateAgeGroup(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/age-groups/{ageGroupId}")] HttpRequestData req,
        string ageGroupId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateAgeGroup");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<AgeGroupDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(ageGroupId, out var ageGroupGuid))
        {
            _logger.LogWarning("Invalid ageGroupId format: {AgeGroupId}", ageGroupId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<AgeGroupDetailDto>.ErrorResponse(
                "Invalid age group ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var dto = await req.ReadFromJsonAsync<UpdateAgeGroupRequestDto>();
        if (dto == null)
        {
            _logger.LogWarning("Failed to deserialize UpdateAgeGroupRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<AgeGroupDetailDto>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var command = new UpdateAgeGroupCommand(ageGroupGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Age group updated successfully: {AgeGroupId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<AgeGroupDetailDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateAgeGroup");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<AgeGroupDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateAgeGroup");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<AgeGroupDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
    }
}
