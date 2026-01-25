using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Drill Template endpoints
/// </summary>
public class DrillTemplateFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<DrillTemplateFunctions> _logger;

    public DrillTemplateFunctions(IMediator mediator, ILogger<DrillTemplateFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get drill templates at club level
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>Drill templates accessible at club level</returns>
    [Function("GetDrillTemplatesByClub")]
    [OpenApiOperation(operationId: "GetDrillTemplatesByClub", tags: new[] { "DrillTemplates" }, Summary = "Get drill templates by club", Description = "Retrieves all drill templates accessible at the club level")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "category", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by drill template category (technical, tactical, physical, mental, mixed)")]
    [OpenApiParameter(name: "search", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Search term to filter templates by name, description, or attributes")]
    [OpenApiParameter(name: "attributes", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Comma-separated list of attribute codes to filter by (templates must have ALL attributes)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "Drill templates retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetDrillTemplatesByClub(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/drill-templates")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillTemplatesByScopeResponseDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var category = req.Query["category"];
        var search = req.Query["search"];
        var attributesParam = req.Query["attributes"];
        var attributes = !string.IsNullOrEmpty(attributesParam)
            ? attributesParam.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(a => a.Trim()).ToList()
            : null;

        var templates = await _mediator.Send(new GetDrillTemplatesByScopeQuery(
            clubGuid,
            Category: category,
            SearchTerm: search,
            Attributes: attributes));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<DrillTemplatesByScopeResponseDto>.SuccessResponse(templates));
        return response;
    }

    /// <summary>
    /// Get drill templates at age group level (includes inherited club templates)
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>Drill templates accessible at age group level including inherited from club</returns>
    [Function("GetDrillTemplatesByAgeGroup")]
    [OpenApiOperation(operationId: "GetDrillTemplatesByAgeGroup", tags: new[] { "DrillTemplates" }, Summary = "Get drill templates by age group", Description = "Retrieves drill templates accessible at the age group level, including inherited club templates")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiParameter(name: "category", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by drill template category (technical, tactical, physical, mental, mixed)")]
    [OpenApiParameter(name: "search", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Search term to filter templates by name, description, or attributes")]
    [OpenApiParameter(name: "attributes", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Comma-separated list of attribute codes to filter by (templates must have ALL attributes)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "Drill templates retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "Invalid ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetDrillTemplatesByAgeGroup(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/age-groups/{ageGroupId}/drill-templates")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillTemplatesByScopeResponseDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(ageGroupId, out var ageGroupGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillTemplatesByScopeResponseDto>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        var category = req.Query["category"];
        var search = req.Query["search"];
        var attributesParam = req.Query["attributes"];
        var attributes = !string.IsNullOrEmpty(attributesParam)
            ? attributesParam.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(a => a.Trim()).ToList()
            : null;

        var templates = await _mediator.Send(new GetDrillTemplatesByScopeQuery(
            clubGuid,
            AgeGroupId: ageGroupGuid,
            Category: category,
            SearchTerm: search,
            Attributes: attributes));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<DrillTemplatesByScopeResponseDto>.SuccessResponse(templates));
        return response;
    }

    /// <summary>
    /// Get drill templates at team level (includes inherited club and age group templates)
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>Drill templates accessible at team level including inherited from club and age group</returns>
    [Function("GetDrillTemplatesByTeam")]
    [OpenApiOperation(operationId: "GetDrillTemplatesByTeam", tags: new[] { "DrillTemplates" }, Summary = "Get drill templates by team", Description = "Retrieves drill templates accessible at the team level, including inherited club and age group templates")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiParameter(name: "category", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by drill template category (technical, tactical, physical, mental, mixed)")]
    [OpenApiParameter(name: "search", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Search term to filter templates by name, description, or attributes")]
    [OpenApiParameter(name: "attributes", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Comma-separated list of attribute codes to filter by (templates must have ALL attributes)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "Drill templates retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "Invalid ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<DrillTemplatesByScopeResponseDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetDrillTemplatesByTeam(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/drill-templates")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillTemplatesByScopeResponseDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(ageGroupId, out var ageGroupGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillTemplatesByScopeResponseDto>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillTemplatesByScopeResponseDto>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        var category = req.Query["category"];
        var search = req.Query["search"];
        var attributesParam = req.Query["attributes"];
        var attributes = !string.IsNullOrEmpty(attributesParam)
            ? attributesParam.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(a => a.Trim()).ToList()
            : null;

        var templates = await _mediator.Send(new GetDrillTemplatesByScopeQuery(
            clubGuid,
            AgeGroupId: ageGroupGuid,
            TeamId: teamGuid,
            Category: category,
            SearchTerm: search,
            Attributes: attributes));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<DrillTemplatesByScopeResponseDto>.SuccessResponse(templates));
        return response;
    }
}
