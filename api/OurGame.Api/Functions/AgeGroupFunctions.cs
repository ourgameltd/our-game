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
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupStatistics;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupStatistics.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetPlayersByAgeGroupId;
using OurGame.Application.UseCases.AgeGroups.Queries.GetPlayersByAgeGroupId.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetCoachesByAgeGroupId;
using OurGame.Application.UseCases.AgeGroups.Queries.GetCoachesByAgeGroupId.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetReportCardsByAgeGroupId;
using OurGame.Application.UseCases.Clubs.Queries.GetReportCardsByClubId.DTOs;
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
    /// Get age group by ID
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>Age group detail</returns>
    [Function("GetAgeGroupById")]
    [OpenApiOperation(operationId: "GetAgeGroupById", tags: new[] { "AgeGroups" }, Summary = "Get age group by ID", Description = "Retrieves detailed information about an age group")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<AgeGroupDetailDto>), Description = "Age group retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<AgeGroupDetailDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<AgeGroupDetailDto>), Description = "Age group not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<AgeGroupDetailDto>), Description = "Invalid age group ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<AgeGroupDetailDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetAgeGroupById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/age-groups/{ageGroupId}")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<AgeGroupDetailDto>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        var ageGroup = await _mediator.Send(new GetAgeGroupByIdQuery(ageGroupGuid));

        if (ageGroup == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<AgeGroupDetailDto>.ErrorResponse(
                "Age group not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<AgeGroupDetailDto>.SuccessResponse(ageGroup));
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

    /// <summary>
    /// Get all players for a specific age group
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>List of players with full details</returns>
    [Function("GetPlayersByAgeGroupId")]
    [OpenApiOperation(operationId: "GetPlayersByAgeGroupId", tags: new[] { "AgeGroups" }, Summary = "Get players by age group", Description = "Retrieves all players for a specific age group with full details including attributes and evaluations")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiParameter(name: "includeArchived", In = ParameterLocation.Query, Required = false, Type = typeof(bool), Description = "Include archived players (default: false)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupPlayerDto>>), Description = "Players retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupPlayerDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupPlayerDto>>), Description = "No players found for this age group")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupPlayerDto>>), Description = "Invalid age group ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupPlayerDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetPlayersByAgeGroupId(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/age-groups/{ageGroupId}/players")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<AgeGroupPlayerDto>>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        var includeArchivedParam = req.Query["includeArchived"];
        var includeArchived = bool.TryParse(includeArchivedParam, out var includeArchivedValue) && includeArchivedValue;

        var players = await _mediator.Send(new GetPlayersByAgeGroupIdQuery(ageGroupGuid, includeArchived));

        if (players == null || players.Count == 0)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<List<AgeGroupPlayerDto>>.ErrorResponse(
                "No players found for this age group", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<AgeGroupPlayerDto>>.SuccessResponse(players));
        return response;
    }

    /// <summary>
    /// Get coaches for a specific age group
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>List of coaches assigned to teams in the age group</returns>
    [Function("GetCoachesByAgeGroupId")]
    [OpenApiOperation(operationId: "GetCoachesByAgeGroupId", tags: new[] { "AgeGroups", "Coaches" }, Summary = "Get coaches by age group", Description = "Retrieves all coaches assigned to teams in a specific age group")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupCoachDto>>), Description = "Coaches retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupCoachDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupCoachDto>>), Description = "Invalid age group ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupCoachDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetCoachesByAgeGroupId(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/age-groups/{ageGroupId}/coaches")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<AgeGroupCoachDto>>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        var coaches = await _mediator.Send(new GetCoachesByAgeGroupIdQuery(ageGroupGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<AgeGroupCoachDto>>.SuccessResponse(coaches));
        return response;
    }

    /// <summary>
    /// Get report cards for a specific age group
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>List of report cards with player details</returns>
    [Function("GetAgeGroupReportCards")]
    [OpenApiOperation(operationId: "GetAgeGroupReportCards", tags: new[] { "AgeGroups", "ReportCards" }, Summary = "Get report cards by age group", Description = "Retrieves all report cards for players in a specific age group")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "Report cards retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "Invalid age group ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubReportCardDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetAgeGroupReportCards(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/age-groups/{ageGroupId}/report-cards")] HttpRequestData req,
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
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<ClubReportCardDto>>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        var reportCards = await _mediator.Send(new GetReportCardsByAgeGroupIdQuery(ageGroupGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<ClubReportCardDto>>.SuccessResponse(reportCards));
        return response;
    }
}
