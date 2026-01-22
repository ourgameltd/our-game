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
}
