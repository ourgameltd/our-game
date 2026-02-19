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
using OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId.DTOs;
using OurGame.Application.UseCases.Teams.Commands.CreateTeamKit;
using OurGame.Application.UseCases.Teams.Commands.CreateTeamKit.DTOs;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamKit;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamKit.DTOs;
using OurGame.Application.UseCases.Teams.Commands.DeleteTeamKit;
using OurGame.Application.UseCases.Teams.Queries.GetReportCardsByTeamId;
using OurGame.Application.UseCases.Clubs.Queries.GetReportCardsByClubId.DTOs;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeam;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeam.DTOs;
using OurGame.Application.UseCases.Teams.Commands.ArchiveTeam;
using OurGame.Application.UseCases.Teams.Commands.ArchiveTeam.DTOs;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamPlayerSquadNumber;
using OurGame.Api.Functions.Teams;
using OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId.DTOs;

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
    [OpenApiParameter(name: "includeArchived", In = ParameterLocation.Query, Required = false, Type = typeof(bool), Description = "Include archived players (default: false)")]
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

        bool.TryParse(req.Query["includeArchived"], out var includeArchived);

        var players = await _mediator.Send(new GetPlayersByTeamIdQuery(teamGuid, includeArchived));

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

    /// <summary>
    /// Get training sessions for a specific team with optional filters
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>List of training sessions for the team with team and club information</returns>
    [Function("GetTeamTrainingSessions")]
    [OpenApiOperation(operationId: "GetTeamTrainingSessions", tags: new[] { "Teams", "Training Sessions" }, Summary = "Get team training sessions", Description = "Retrieves training sessions for a specific team with optional filters for status and date range")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiParameter(name: "status", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Optional session status filter (scheduled, in-progress, completed, cancelled, upcoming, past)")]
    [OpenApiParameter(name: "dateFrom", In = ParameterLocation.Query, Required = false, Type = typeof(DateTime), Description = "Optional start date filter (ISO 8601 format)")]
    [OpenApiParameter(name: "dateTo", In = ParameterLocation.Query, Required = false, Type = typeof(DateTime), Description = "Optional end date filter (ISO 8601 format)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<TeamTrainingSessionsDto>), Description = "Training sessions retrieved successfully")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.BadRequest, Description = "Invalid team ID or date format")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Team not found")]
    public async Task<HttpResponseData> GetTeamTrainingSessions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/{teamId}/training-sessions")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamTrainingSessionsDto>.ErrorResponse(
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
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamTrainingSessionsDto>.ErrorResponse(
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
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamTrainingSessionsDto>.ErrorResponse(
                    "Invalid dateTo format. Use ISO 8601 format (e.g., 2024-12-31T23:59:59Z)", 400));
                return badRequestResponse;
            }
            dateTo = parsedDateTo;
        }

        try
        {
            var sessions = await _mediator.Send(new GetTrainingSessionsByTeamIdQuery(teamGuid, status, dateFrom, dateTo));

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<TeamTrainingSessionsDto>.SuccessResponse(sessions));
            return response;
        }
        catch (KeyNotFoundException)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamTrainingSessionsDto>.ErrorResponse(
                "Team not found", 404));
            return notFoundResponse;
        }
    }

    /// <summary>
    /// Get kits for a specific team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>List of kits for the team</returns>
    [Function("GetTeamKits")]
    [OpenApiOperation(operationId: "GetTeamKits", tags: new[] { "Teams" }, Summary = "Get team kits", Description = "Retrieves all kits for a specific team")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitsDto>), Description = "Kits retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitsDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitsDto>), Description = "Invalid team ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitsDto>), Description = "Team not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitsDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTeamKits(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/{teamId}/kits")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamKitsDto>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        var result = await _mediator.Send(new GetKitsByTeamIdQuery(teamGuid));

        if (result.IsNotFound)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamKitsDto>.ErrorResponse(
                result.ErrorMessage ?? "Team not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<TeamKitsDto>.SuccessResponse(result.Value!));
        return response;
    }

    /// <summary>
    /// Create a new kit for a team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>The created kit</returns>
    [Function("CreateTeamKit")]
    [OpenApiOperation(operationId: "CreateTeamKit", tags: new[] { "Teams" }, Summary = "Create team kit", Description = "Creates a new kit for a specific team")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreateTeamKitRequestDto), Required = true, Description = "Kit details")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitDto>), Description = "Kit created successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitDto>), Description = "Invalid request data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitDto>), Description = "Team not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> CreateTeamKit(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/teams/{teamId}/kits")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<CreateTeamKitRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize CreateTeamKitRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreateTeamKitCommand(teamGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Team kit created successfully: {KitId} for team {TeamId}", result.Id, teamGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            successResponse.Headers.Add("Location", $"/v1/teams/{teamGuid}/kits/{result.Id}");
            await successResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateTeamKit");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateTeamKit");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating team kit");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.ErrorResponse(
                "An error occurred while creating the team kit",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Update an existing team kit
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <param name="kitId">The kit ID</param>
    /// <returns>The updated kit</returns>
    [Function("UpdateTeamKit")]
    [OpenApiOperation(operationId: "UpdateTeamKit", tags: new[] { "Teams" }, Summary = "Update team kit", Description = "Updates an existing kit for a specific team")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiParameter(name: "kitId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The kit ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateTeamKitRequestDto), Required = true, Description = "Updated kit details")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitDto>), Description = "Kit updated successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitDto>), Description = "Invalid request data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitDto>), Description = "Team or kit not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<TeamKitDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> UpdateTeamKit(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/teams/{teamId}/kits/{kitId}")] HttpRequestData req,
        string teamId,
        string kitId)
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(kitId, out var kitGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.ErrorResponse(
                "Invalid kit ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateTeamKitRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateTeamKitRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdateTeamKitCommand(teamGuid, kitGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Team kit updated successfully: {KitId} for team {TeamId}", kitGuid, teamGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateTeamKit");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateTeamKit");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating team kit");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TeamKitDto>.ErrorResponse(
                "An error occurred while updating the team kit",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Delete a team kit
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <param name="kitId">The kit ID</param>
    /// <returns>No content on success</returns>
    [Function("DeleteTeamKit")]
    [OpenApiOperation(operationId: "DeleteTeamKit", tags: new[] { "Teams" }, Summary = "Delete team kit", Description = "Deletes a kit from a specific team")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiParameter(name: "kitId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The kit ID")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Kit deleted successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invalid ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Team or kit not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> DeleteTeamKit(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "v1/teams/{teamId}/kits/{kitId}")] HttpRequestData req,
        string teamId,
        string kitId)
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(kitId, out var kitGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid kit ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var command = new DeleteTeamKitCommand(teamGuid, kitGuid);
            await _mediator.Send(command);

            _logger.LogInformation("Team kit deleted successfully: {KitId} for team {TeamId}", kitGuid, teamGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.NoContent);
            return successResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during DeleteTeamKit");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting team kit");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while deleting the team kit",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Get report cards for players in a specific team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>List of report cards for players in the team</returns>
    [Function("GetTeamReportCards")]
    [OpenApiOperation(operationId: "GetTeamReportCards", tags: new[] { "Teams", "ReportCards" }, Summary = "Get team report cards", Description = "Retrieves all player report cards for a specific team")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "Report cards retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "Invalid team ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTeamReportCards(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/{teamId}/report-cards")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<ClubReportCardDto>>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        var reportCards = await _mediator.Send(new GetReportCardsByTeamIdQuery(teamGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<ClubReportCardDto>>.SuccessResponse(reportCards));
        return response;
    }

    /// <summary>
    /// Update a team's details (name, colors, level, etc.)
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>The updated team details</returns>
    [Function("UpdateTeam")]
    [OpenApiOperation(operationId: "UpdateTeam", tags: new[] { "Teams" }, Summary = "Update team", Description = "Updates a team's details including name, colors, level, and season")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateTeamRequestDto), Required = true, Description = "Team update details")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<TeamOverviewTeamDto>), Description = "Team updated successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<TeamOverviewTeamDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<TeamOverviewTeamDto>), Description = "Invalid request data or team is archived")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<TeamOverviewTeamDto>), Description = "Team not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<TeamOverviewTeamDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> UpdateTeam(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/teams/{teamId}")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateTeamRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateTeamRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdateTeamCommand(teamGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Team updated successfully: {TeamId}", teamGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateTeam");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateTeam");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating team");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ErrorResponse(
                "An error occurred while updating the team",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Update squad numbers for multiple players in a team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>Success response</returns>
    [Function("UpdateTeamSquadNumbers")]
    [OpenApiOperation(operationId: "UpdateTeamSquadNumbers", tags: new[] { "Teams" }, Summary = "Update squad numbers", Description = "Updates squad numbers for multiple players in a team")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateSquadNumbersRequestDto), Required = true, Description = "List of player squad number assignments")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Squad numbers updated successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invalid request data or duplicate squad numbers")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Team or player not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> UpdateTeamSquadNumbers(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/teams/{teamId}/squad-numbers")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateSquadNumbersRequestDto>();
            if (dto == null || dto.Assignments == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateSquadNumbersRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            // Check for duplicate squad numbers in the request
            var assignedNumbers = dto.Assignments
                .Where(a => a.SquadNumber.HasValue)
                .Select(a => a.SquadNumber!.Value)
                .ToList();

            var duplicates = assignedNumbers
                .GroupBy(n => n)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicates.Any())
            {
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                    $"Duplicate squad numbers detected: {string.Join(", ", duplicates)}",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            // Update each assignment
            foreach (var assignment in dto.Assignments)
            {
                if (assignment.SquadNumber.HasValue)
                {
                    var command = new UpdateTeamPlayerSquadNumberCommand(
                        teamGuid,
                        assignment.PlayerId,
                        assignment.SquadNumber.Value,
                        azureUserId);

                    var result = await _mediator.Send(command);

                    if (result.IsNotFound)
                    {
                        var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                        await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                            result.ErrorMessage ?? "Player or team not found",
                            (int)HttpStatusCode.NotFound));
                        return notFoundResponse;
                    }

                    if (result.IsFailure)
                    {
                        var failureResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                        await failureResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                            result.ErrorMessage ?? "Failed to update squad number",
                            (int)HttpStatusCode.BadRequest));
                        return failureResponse;
                    }
                }
            }

            _logger.LogInformation("Squad numbers updated successfully for team: {TeamId}", teamGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<object>.SuccessResponse(new { message = "Squad numbers updated successfully" }));
            return successResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating squad numbers");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while updating squad numbers",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Archive or unarchive a team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>No content on success</returns>
    [Function("ArchiveTeam")]
    [OpenApiOperation(operationId: "ArchiveTeam", tags: new[] { "Teams" }, Summary = "Archive/unarchive team", Description = "Archives or unarchives a team")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(ArchiveTeamRequestDto), Required = true, Description = "Archive status")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Team archive status updated successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invalid request data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Team not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> ArchiveTeam(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/teams/{teamId}/archive")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<ArchiveTeamRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize ArchiveTeamRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new ArchiveTeamCommand(teamGuid, dto);
            await _mediator.Send(command);

            _logger.LogInformation("Team archive status updated: {TeamId} - IsArchived: {IsArchived}", teamGuid, dto.IsArchived);
            var successResponse = req.CreateResponse(HttpStatusCode.NoContent);
            return successResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during ArchiveTeam");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving team");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while updating team archive status",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
