using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupsByClubId;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupsByClubId.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupStatistics;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupStatistics.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Age Group endpoints
/// </summary>
public class AgeGroupFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<AgeGroupFunctions> _logger;

    public AgeGroupFunctions(IMediator mediator, ILogger<AgeGroupFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all age groups for a club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>List of age groups</returns>
    [Function("GetAgeGroupsByClubId")]
    [OpenApiOperation(operationId: "GetAgeGroupsByClubId", tags: new[] { "AgeGroups" }, Summary = "Get age groups by club", Description = "Retrieves all age groups for a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "includeArchived", In = ParameterLocation.Query, Required = false, Type = typeof(bool), Description = "Include archived age groups (default: false)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupListDto>>), Description = "Age groups retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupListDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupListDto>>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupListDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetAgeGroupsByClubId(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/age-groups")] HttpRequestData req,
        string clubId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<AgeGroupListDto>>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var includeArchivedParam = req.Query["includeArchived"];
        var includeArchived = bool.TryParse(includeArchivedParam, out var includeArchivedValue) && includeArchivedValue;

        var ageGroups = await _mediator.Send(new GetAgeGroupsByClubIdQuery(clubGuid, includeArchived));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<AgeGroupListDto>>.SuccessResponse(ageGroups));
        return response;
    }

    /// <summary>
    /// Get statistics for a specific age group
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>Age group statistics</returns>
    [Function("GetAgeGroupStatistics")]
    [OpenApiOperation(operationId: "GetAgeGroupStatistics", tags: new[] { "AgeGroups" }, Summary = "Get age group statistics", Description = "Retrieves comprehensive statistics for a specific age group")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<AgeGroupStatisticsDto>), Description = "Statistics retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<AgeGroupStatisticsDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<AgeGroupStatisticsDto>), Description = "Invalid age group ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<AgeGroupStatisticsDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetAgeGroupStatistics(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/age-groups/{ageGroupId}/statistics")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<AgeGroupStatisticsDto>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        var statistics = await _mediator.Send(new GetAgeGroupStatisticsQuery(ageGroupGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<AgeGroupStatisticsDto>.SuccessResponse(statistics));
        return response;
    }
}
