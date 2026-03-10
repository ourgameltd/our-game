using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.AgeGroups.Commands.ArchiveAgeGroup;
using OurGame.Application.UseCases.AgeGroups.Commands.ArchiveAgeGroup.DTOs;
using System.Net;

namespace OurGame.Api.Functions.AgeGroups;

/// <summary>
/// Azure Function for archiving/unarchiving age groups
/// </summary>
public class ArchiveAgeGroupFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<ArchiveAgeGroupFunction> _logger;

    public ArchiveAgeGroupFunction(IMediator mediator, ILogger<ArchiveAgeGroupFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Archive or unarchive an age group
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>No content on success</returns>
    [Function("ArchiveAgeGroup")]
    [OpenApiOperation(operationId: "ArchiveAgeGroup", tags: new[] { "Age Groups" }, Summary = "Archive/unarchive age group", Description = "Archives or unarchives an age group")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(ArchiveAgeGroupRequestDto), Required = true, Description = "Archive status")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Age group archive status updated successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invalid request data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Age group not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> ArchiveAgeGroup(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/age-groups/{ageGroupId}/archive")] HttpRequestData req,
        string ageGroupId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(ageGroupId, out var ageGroupGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<ArchiveAgeGroupRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize ArchiveAgeGroupRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new ArchiveAgeGroupCommand(ageGroupGuid, dto);
            await _mediator.Send(command);

            _logger.LogInformation("Age group archive status updated: {AgeGroupId} - IsArchived: {IsArchived}", ageGroupGuid, dto.IsArchived);
            var successResponse = req.CreateResponse(HttpStatusCode.NoContent);
            return successResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during ArchiveAgeGroup");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving age group");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while updating age group archive status",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
