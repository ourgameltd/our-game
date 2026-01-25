using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Drills.Queries.GetDrillsByScope;
using OurGame.Application.UseCases.Drills.Queries.GetDrillsByScope.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Drill endpoints
/// </summary>
public class DrillFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<DrillFunctions> _logger;

    public DrillFunctions(IMediator mediator, ILogger<DrillFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get drills at club level
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>Drills accessible at club level</returns>
    [Function("GetDrillsByClub")]
    [OpenApiOperation(operationId: "GetDrillsByClub", tags: new[] { "Drills" }, Summary = "Get drills by club", Description = "Retrieves all drills accessible at the club level")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "category", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by drill category (technical, tactical, physical, mental)")]
    [OpenApiParameter(name: "search", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Search term to filter drills by name, description, or attributes")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "Drills retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetDrillsByClub(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/drills")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillsByScopeResponseDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var category = req.Query["category"];
        var search = req.Query["search"];

        var drills = await _mediator.Send(new GetDrillsByScopeQuery(
            clubGuid,
            Category: category,
            SearchTerm: search));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<DrillsByScopeResponseDto>.SuccessResponse(drills));
        return response;
    }

    /// <summary>
    /// Get drills at age group level (includes inherited club drills)
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>Drills accessible at age group level including inherited from club</returns>
    [Function("GetDrillsByAgeGroup")]
    [OpenApiOperation(operationId: "GetDrillsByAgeGroup", tags: new[] { "Drills" }, Summary = "Get drills by age group", Description = "Retrieves drills accessible at the age group level, including inherited club drills")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiParameter(name: "category", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by drill category (technical, tactical, physical, mental)")]
    [OpenApiParameter(name: "search", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Search term to filter drills by name, description, or attributes")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "Drills retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "Invalid ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetDrillsByAgeGroup(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/age-groups/{ageGroupId}/drills")] HttpRequestData req,
        string clubId,
        string ageGroupId)
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillsByScopeResponseDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(ageGroupId, out var ageGroupGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillsByScopeResponseDto>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        var category = req.Query["category"];
        var search = req.Query["search"];

        var drills = await _mediator.Send(new GetDrillsByScopeQuery(
            clubGuid,
            AgeGroupId: ageGroupGuid,
            Category: category,
            SearchTerm: search));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<DrillsByScopeResponseDto>.SuccessResponse(drills));
        return response;
    }

    /// <summary>
    /// Get drills at team level (includes inherited club and age group drills)
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>Drills accessible at team level including inherited from club and age group</returns>
    [Function("GetDrillsByTeam")]
    [OpenApiOperation(operationId: "GetDrillsByTeam", tags: new[] { "Drills" }, Summary = "Get drills by team", Description = "Retrieves drills accessible at the team level, including inherited club and age group drills")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiParameter(name: "category", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by drill category (technical, tactical, physical, mental)")]
    [OpenApiParameter(name: "search", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Search term to filter drills by name, description, or attributes")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "Drills retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "Invalid ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<DrillsByScopeResponseDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetDrillsByTeam(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/drills")] HttpRequestData req,
        string clubId,
        string ageGroupId,
        string teamId)
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillsByScopeResponseDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(ageGroupId, out var ageGroupGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillsByScopeResponseDto>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillsByScopeResponseDto>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        var category = req.Query["category"];
        var search = req.Query["search"];

        var drills = await _mediator.Send(new GetDrillsByScopeQuery(
            clubGuid,
            AgeGroupId: ageGroupGuid,
            TeamId: teamGuid,
            Category: category,
            SearchTerm: search));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<DrillsByScopeResponseDto>.SuccessResponse(drills));
        return response;
    }
}
