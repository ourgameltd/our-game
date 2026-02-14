using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubStatistics;
using OurGame.Application.UseCases.Clubs.Queries.GetClubStatistics.DTOs;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId;
using OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByClubId;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByClubId.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetTrainingSessionsByClubId;
using OurGame.Application.UseCases.Clubs.Queries.GetTrainingSessionsByClubId.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetMatchesByClubId;
using OurGame.Application.UseCases.Clubs.Queries.GetMatchesByClubId.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId;
using OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetReportCardsByClubId;
using OurGame.Application.UseCases.Clubs.Queries.GetReportCardsByClubId.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetDevelopmentPlansByClubId;
using OurGame.Application.UseCases.Clubs.Queries.GetDevelopmentPlansByClubId.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Club endpoints
/// </summary>
public class ClubFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<ClubFunctions> _logger;

    public ClubFunctions(IMediator mediator, ILogger<ClubFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get club details by ID
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>Club detail information</returns>
    [Function("GetClubById")]
    [OpenApiOperation(operationId: "GetClubById", tags: new[] { "Clubs" }, Summary = "Get club by ID", Description = "Retrieves detailed information about a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<ClubDetailDto>), Description = "Club retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ClubDetailDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<ClubDetailDto>), Description = "Club not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubDetailDto>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<ClubDetailDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var club = await _mediator.Send(new GetClubByIdQuery(clubGuid));

        if (club == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.ErrorResponse(
                "Club not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.SuccessResponse(club));
        return response;
    }

    /// <summary>
    /// Get club statistics including matches, players, and performance metrics
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>Club statistics</returns>
    [Function("GetClubStatistics")]
    [OpenApiOperation(operationId: "GetClubStatistics", tags: new[] { "Clubs" }, Summary = "Get club statistics", Description = "Retrieves comprehensive statistics for a club including match results, player counts, and upcoming fixtures")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<ClubStatisticsDto>), Description = "Statistics retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ClubStatisticsDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubStatisticsDto>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<ClubStatisticsDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubStatistics(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/statistics")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubStatisticsDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var statistics = await _mediator.Send(new GetClubStatisticsQuery(clubGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<ClubStatisticsDto>.SuccessResponse(statistics));
        return response;
    }

    /// <summary>
    /// Get all players for a specific club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>List of players in the club</returns>
    [Function("GetClubPlayers")]
    [OpenApiOperation(operationId: "GetClubPlayers", tags: new[] { "Clubs", "Players" }, Summary = "Get club players", Description = "Retrieves all players registered to a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "includeArchived", In = ParameterLocation.Query, Required = false, Type = typeof(bool), Description = "Include archived players (default: false)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubPlayerDto>>), Description = "Players retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubPlayerDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubPlayerDto>>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubPlayerDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubPlayers(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/players")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<ClubPlayerDto>>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var includeArchived = req.GetQueryParam("includeArchived")?.ToLower() == "true";
        var players = await _mediator.Send(new GetPlayersByClubIdQuery(clubGuid, includeArchived));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<ClubPlayerDto>>.SuccessResponse(players));
        return response;
    }

    /// <summary>
    /// Get all teams for a specific club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>List of teams in the club</returns>
    [Function("GetClubTeams")]
    [OpenApiOperation(operationId: "GetClubTeams", tags: new[] { "Clubs", "Teams" }, Summary = "Get club teams", Description = "Retrieves all teams for a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "includeArchived", In = ParameterLocation.Query, Required = false, Type = typeof(bool), Description = "Include archived teams (default: false)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubTeamDto>>), Description = "Teams retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubTeamDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubTeamDto>>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubTeamDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubTeams(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/teams")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<ClubTeamDto>>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var includeArchived = req.GetQueryParam("includeArchived")?.ToLower() == "true";
        var teams = await _mediator.Send(new GetTeamsByClubIdQuery(clubGuid, includeArchived));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<ClubTeamDto>>.SuccessResponse(teams));
        return response;
    }

    /// <summary>
    /// Get all coaches for a specific club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>List of coaches in the club</returns>
    [Function("GetClubCoaches")]
    [OpenApiOperation(operationId: "GetClubCoaches", tags: new[] { "Clubs", "Coaches" }, Summary = "Get club coaches", Description = "Retrieves all coaches for a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "includeArchived", In = ParameterLocation.Query, Required = false, Type = typeof(bool), Description = "Include archived coaches (default: false)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubCoachDto>>), Description = "Coaches retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubCoachDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubCoachDto>>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubCoachDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubCoaches(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/coaches")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<ClubCoachDto>>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var includeArchived = req.GetQueryParam("includeArchived")?.ToLower() == "true";
        var coaches = await _mediator.Send(new GetCoachesByClubIdQuery(clubGuid, includeArchived));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<ClubCoachDto>>.SuccessResponse(coaches));
        return response;
    }

    /// <summary>
    /// Get all training sessions for a specific club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>List of training sessions in the club</returns>
    [Function("GetClubTrainingSessions")]
    [OpenApiOperation(operationId: "GetClubTrainingSessions", tags: new[] { "Clubs", "TrainingSessions" }, Summary = "Get club training sessions", Description = "Retrieves all training sessions for a specific club with optional filtering")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Query, Required = false, Type = typeof(Guid), Description = "Filter by age group ID")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Query, Required = false, Type = typeof(Guid), Description = "Filter by team ID")]
    [OpenApiParameter(name: "status", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by status (upcoming, past, scheduled, completed, cancelled, all)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<ClubTrainingSessionsDto>), Description = "Training sessions retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ClubTrainingSessionsDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubTrainingSessionsDto>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<ClubTrainingSessionsDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubTrainingSessions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/training-sessions")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubTrainingSessionsDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        Guid? ageGroupGuid = null;
        var ageGroupIdParam = req.GetQueryParam("ageGroupId");
        if (!string.IsNullOrEmpty(ageGroupIdParam) && Guid.TryParse(ageGroupIdParam, out var parsedAgeGroupId))
        {
            ageGroupGuid = parsedAgeGroupId;
        }

        Guid? teamGuid = null;
        var teamIdParam = req.GetQueryParam("teamId");
        if (!string.IsNullOrEmpty(teamIdParam) && Guid.TryParse(teamIdParam, out var parsedTeamId))
        {
            teamGuid = parsedTeamId;
        }

        var status = req.GetQueryParam("status");

        var trainingSessions = await _mediator.Send(new GetTrainingSessionsByClubIdQuery(
            clubGuid,
            ageGroupGuid,
            teamGuid,
            status));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<ClubTrainingSessionsDto>.SuccessResponse(trainingSessions));
        return response;
    }

    /// <summary>
    /// Get all matches for a specific club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>List of matches in the club</returns>
    [Function("GetClubMatches")]
    [OpenApiOperation(operationId: "GetClubMatches", tags: new[] { "Clubs", "Matches" }, Summary = "Get club matches", Description = "Retrieves all matches for a specific club with optional filtering")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Query, Required = false, Type = typeof(Guid), Description = "Filter by age group ID")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Query, Required = false, Type = typeof(Guid), Description = "Filter by team ID")]
    [OpenApiParameter(name: "status", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by status (upcoming, past, scheduled, completed, cancelled, all)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<ClubMatchesDto>), Description = "Matches retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ClubMatchesDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubMatchesDto>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<ClubMatchesDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubMatches(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/matches")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubMatchesDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        Guid? ageGroupGuid = null;
        var ageGroupIdParam = req.GetQueryParam("ageGroupId");
        if (!string.IsNullOrEmpty(ageGroupIdParam) && Guid.TryParse(ageGroupIdParam, out var parsedAgeGroupId))
        {
            ageGroupGuid = parsedAgeGroupId;
        }

        Guid? teamGuid = null;
        var teamIdParam = req.GetQueryParam("teamId");
        if (!string.IsNullOrEmpty(teamIdParam) && Guid.TryParse(teamIdParam, out var parsedTeamId))
        {
            teamGuid = parsedTeamId;
        }

        var status = req.GetQueryParam("status");

        var matches = await _mediator.Send(new GetMatchesByClubIdQuery(
            clubGuid,
            ageGroupGuid,
            teamGuid,
            status));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<ClubMatchesDto>.SuccessResponse(matches));
        return response;
    }

    /// <summary>
    /// Get all kits for a specific club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>List of club-level kits</returns>
    [Function("GetClubKits")]
    [OpenApiOperation(operationId: "GetClubKits", tags: new[] { "Clubs", "Kits" }, Summary = "Get club kits", Description = "Retrieves all club-level kits (not team-specific kits)")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubKitDto>>), Description = "Kits retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubKitDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubKitDto>>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubKitDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubKits(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/kits")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<ClubKitDto>>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var kits = await _mediator.Send(new GetKitsByClubIdQuery(clubGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<ClubKitDto>>.SuccessResponse(kits));
        return response;
    }

    /// <summary>
    /// Get all report cards for a specific club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>List of report cards for players in the club</returns>
    [Function("GetClubReportCards")]
    [OpenApiOperation(operationId: "GetClubReportCards", tags: new[] { "Clubs", "ReportCards" }, Summary = "Get club report cards", Description = "Retrieves all player report cards for a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "Report cards retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubReportCards(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/report-cards")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<ClubReportCardDto>>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var reportCards = await _mediator.Send(new GetReportCardsByClubIdQuery(clubGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<ClubReportCardDto>>.SuccessResponse(reportCards));
        return response;
    }

    /// <summary>
    /// Get all development plans for a specific club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>List of development plans for players in the club</returns>
    [Function("GetClubDevelopmentPlans")]
    [OpenApiOperation(operationId: "GetClubDevelopmentPlans", tags: new[] { "Clubs", "DevelopmentPlans" }, Summary = "Get all development plans for a club", Description = "Returns all development plans for the specified club with player details and goals")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club identifier")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubDevelopmentPlanDto>>), Description = "Successfully retrieved development plans")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.BadRequest, Description = "Invalid club ID format")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.InternalServerError, Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubDevelopmentPlans(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/development-plans")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<ClubDevelopmentPlanDto>>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var developmentPlans = await _mediator.Send(new GetDevelopmentPlansByClubIdQuery(clubGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<ClubDevelopmentPlanDto>>.SuccessResponse(developmentPlans));
        return response;
    }
}
