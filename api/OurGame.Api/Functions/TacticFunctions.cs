using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Tactics endpoints
/// </summary>
public class TacticFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<TacticFunctions> _logger;

    public TacticFunctions(IMediator mediator, ILogger<TacticFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get tactics by scope for a club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>Tactics at club level and inherited tactics</returns>
    [Function("GetTacticsByClub")]
    [OpenApiOperation(operationId: "GetTacticsByClub", tags: new[] { "Tactics" }, Summary = "Get tactics by club", Description = "Retrieves tactics defined at the club level")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "Tactics retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTacticsByClub(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/tactics")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TacticsByScopeResponseDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var result = await _mediator.Send(new GetTacticsByScopeQuery(clubGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<TacticsByScopeResponseDto>.SuccessResponse(result));
        return response;
    }

    /// <summary>
    /// Get tactics by scope for an age group
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>Tactics at age group level and inherited tactics from club</returns>
    [Function("GetTacticsByAgeGroup")]
    [OpenApiOperation(operationId: "GetTacticsByAgeGroup", tags: new[] { "Tactics" }, Summary = "Get tactics by age group", Description = "Retrieves tactics defined at the age group level plus inherited tactics from the club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "Tactics retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "Invalid ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTacticsByAgeGroup(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/age-groups/{ageGroupId}/tactics")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TacticsByScopeResponseDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(ageGroupId, out var ageGroupGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TacticsByScopeResponseDto>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        var result = await _mediator.Send(new GetTacticsByScopeQuery(clubGuid, ageGroupGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<TacticsByScopeResponseDto>.SuccessResponse(result));
        return response;
    }

    /// <summary>
    /// Get tactics by scope for a team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>Tactics at team level and inherited tactics from club and age group</returns>
    [Function("GetTacticsByTeam")]
    [OpenApiOperation(operationId: "GetTacticsByTeam", tags: new[] { "Tactics" }, Summary = "Get tactics by team", Description = "Retrieves tactics defined at the team level plus inherited tactics from the club and age group")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "Tactics retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "Invalid ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<TacticsByScopeResponseDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTacticsByTeam(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/tactics")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TacticsByScopeResponseDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(ageGroupId, out var ageGroupGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TacticsByScopeResponseDto>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TacticsByScopeResponseDto>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        var result = await _mediator.Send(new GetTacticsByScopeQuery(clubGuid, ageGroupGuid, teamGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<TacticsByScopeResponseDto>.SuccessResponse(result));
        return response;
    }
}
