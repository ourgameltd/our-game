using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Application.Abstractions.Responses;
using OurGame.Api.Extensions;
using System.Net;
using OurGame.Application.UseCases.Teams.Queries.GetMyTeamsAndClubs.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetMyTeamsAndClubs;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByAgeGroupId;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByAgeGroupId.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetPlayersByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetPlayersByTeamId.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId;
using TeamCoachResponseDto = OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs.TeamCoachDto;
using OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId.DTOs;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Team endpoints
/// </summary>
public class TeamFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<TeamFunctions> _logger;

    public TeamFunctions(IMediator mediator, ILogger<TeamFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get teams accessible for the current user (coach assignments)
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>List of teams the user has access to</returns>
    [Function("GetMyTeams")]
    [OpenApiOperation(operationId: "GetMyTeams", tags: new[] { "Teams" }, Summary = "Get my teams", Description = "Retrieves teams the current user has access to via coach assignments")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamAndClubsListItemDto>>), Description = "Teams retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamAndClubsListItemDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamAndClubsListItemDto>>), Description = "User profile not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamAndClubsListItemDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetMyTeams(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/me")] HttpRequestData req)
    {
            var azureUserId = req.GetUserId();

            if (string.IsNullOrEmpty(azureUserId))
            {
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            var teams = await _mediator.Send(new GetMyTeamsAndClubsQuery(azureUserId));

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<List<TeamAndClubsListItemDto>>.SuccessResponse(teams));
            return response;
    }

    /// <summary>
    /// Get teams for a specific age group
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>List of teams in the age group</returns>
    [Function("GetTeamsByAgeGroupId")]
    [OpenApiOperation(operationId: "GetTeamsByAgeGroupId", tags: new[] { "Teams" }, Summary = "Get teams by age group", Description = "Retrieves teams for a specific age group with summary stats")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamWithStatsDto>>), Description = "Teams retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamWithStatsDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamWithStatsDto>>), Description = "Invalid age group ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamWithStatsDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTeamsByAgeGroupId(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/age-groups/{ageGroupId}/teams")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<TeamWithStatsDto>>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        var teams = await _mediator.Send(new GetTeamsByAgeGroupIdQuery(ageGroupGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<TeamWithStatsDto>>.SuccessResponse(teams));
        return response;
    }

    /// <summary>
    /// Get overview data for a specific team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>Team overview data</returns>
    [Function("GetTeamOverview")]
    [OpenApiOperation(operationId: "GetTeamOverview", tags: new[] { "Teams" }, Summary = "Get team overview", Description = "Retrieves team overview data including statistics, matches, and upcoming training sessions")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<TeamOverviewDto>), Description = "Team overview retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<TeamOverviewDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<TeamOverviewDto>), Description = "Team not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<TeamOverviewDto>), Description = "Invalid team ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<TeamOverviewDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTeamOverview(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/{teamId}/overview")] HttpRequestData req,
        string teamId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewDto>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        var overview = await _mediator.Send(new GetTeamOverviewQuery(teamGuid));

        if (overview == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewDto>.ErrorResponse(
                "Team not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<TeamOverviewDto>.SuccessResponse(overview));
        return response;
    }

    /// <summary>
    /// Get players for a specific team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>List of players in the team with squad numbers</returns>
    [Function("GetTeamPlayers")]
    [OpenApiOperation(operationId: "GetTeamPlayers", tags: new[] { "Teams" }, Summary = "Get team players", Description = "Retrieves players assigned to a specific team with squad numbers and ratings")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamPlayerDto>>), Description = "Players retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamPlayerDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamPlayerDto>>), Description = "Invalid team ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamPlayerDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTeamPlayers(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/{teamId}/players")] HttpRequestData req,
        string teamId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<TeamPlayerDto>>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        var players = await _mediator.Send(new GetPlayersByTeamIdQuery(teamGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<TeamPlayerDto>>.SuccessResponse(players));
        return response;
    }

    /// <summary>
    /// Get coaches for a specific team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>List of coaches assigned to the team</returns>
    [Function("GetTeamCoaches")]
    [OpenApiOperation(operationId: "GetTeamCoaches", tags: new[] { "Teams" }, Summary = "Get team coaches", Description = "Retrieves coaches assigned to a specific team with roles")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamCoachResponseDto>>), Description = "Coaches retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamCoachResponseDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamCoachResponseDto>>), Description = "Invalid team ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamCoachResponseDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTeamCoaches(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/{teamId}/coaches")] HttpRequestData req,
        string teamId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<TeamCoachResponseDto>>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        var coaches = await _mediator.Send(new GetCoachesByTeamIdQuery(teamGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<TeamCoachResponseDto>>.SuccessResponse(coaches));
        return response;
    }

    /// <summary>
    /// Get matches for a specific team with optional filters
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>List of matches for the team with team and club information</returns>
    [Function("GetTeamMatches")]
    [OpenApiOperation(operationId: "GetTeamMatches", tags: new[] { "Teams" }, Summary = "Get team matches", Description = "Retrieves matches for a specific team with optional filters for status and date range")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiParameter(name: "status", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Optional match status filter (scheduled, in-progress, completed, cancelled, upcoming)")]
    [OpenApiParameter(name: "dateFrom", In = ParameterLocation.Query, Required = false, Type = typeof(DateTime), Description = "Optional start date filter (ISO 8601 format)")]
    [OpenApiParameter(name: "dateTo", In = ParameterLocation.Query, Required = false, Type = typeof(DateTime), Description = "Optional end date filter (ISO 8601 format)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<TeamMatchesDto>), Description = "Matches retrieved successfully")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.BadRequest, Description = "Invalid team ID or date format")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Team not found")]
    public async Task<HttpResponseData> GetTeamMatches(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/{teamId}/matches")] HttpRequestData req,
        string teamId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamMatchesDto>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        // Parse optional query parameters
        var queryParams = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        var status = queryParams["status"];
        
        DateTime? dateFrom = null;
        if (!string.IsNullOrEmpty(queryParams["dateFrom"]))
        {
            if (!DateTime.TryParse(queryParams["dateFrom"], out var parsedDateFrom))
            {
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamMatchesDto>.ErrorResponse(
                    "Invalid dateFrom format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)", 400));
                return badRequestResponse;
            }
            dateFrom = parsedDateFrom;
        }

        DateTime? dateTo = null;
        if (!string.IsNullOrEmpty(queryParams["dateTo"]))
        {
            if (!DateTime.TryParse(queryParams["dateTo"], out var parsedDateTo))
            {
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamMatchesDto>.ErrorResponse(
                    "Invalid dateTo format. Use ISO 8601 format (e.g., 2024-12-31T23:59:59Z)", 400));
                return badRequestResponse;
            }
            dateTo = parsedDateTo;
        }

        try
        {
            var matches = await _mediator.Send(new GetMatchesByTeamIdQuery(teamGuid, status, dateFrom, dateTo));

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<TeamMatchesDto>.SuccessResponse(matches));
            return response;
        }
        catch (KeyNotFoundException)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamMatchesDto>.ErrorResponse(
                "Team not found", 404));
            return notFoundResponse;
        }
    }
}
