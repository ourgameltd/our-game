using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerRecentPerformances;
using OurGame.Application.UseCases.Players.Queries.GetPlayerRecentPerformances.DTOs;
using OurGame.Persistence.Models;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for retrieving player's recent match performances
/// </summary>
public class GetPlayerRecentPerformancesFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetPlayerRecentPerformancesFunction> _logger;
    private readonly OurGameContext _db;

    public GetPlayerRecentPerformancesFunction(IMediator mediator, ILogger<GetPlayerRecentPerformancesFunction> logger, OurGameContext db)
    {
        _mediator = mediator;
        _logger = logger;
        _db = db;
    }

    /// <summary>
    /// Get player's recent match performances with ratings, goals, and assists
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="playerId">The player ID</param>
    /// <returns>List of recent performances</returns>
    [Function("GetPlayerRecentPerformances")]
    [OpenApiOperation(
        operationId: "GetPlayerRecentPerformances",
        tags: new[] { "Players" },
        Summary = "Get player's recent match performances",
        Description = "Retrieves player's recent completed match performances including ratings, goals, assists, and match context. Access is restricted to authorized users (coaches, the player, or parents).")]
    [OpenApiParameter(
        name: "playerId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The player ID")]
    [OpenApiParameter(
        name: "limit",
        In = ParameterLocation.Query,
        Required = false,
        Type = typeof(int),
        Description = "Maximum number of performances to return (default: 10)")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerRecentPerformanceDto>>),
        Description = "Recent performances retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerRecentPerformanceDto>>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerRecentPerformanceDto>>),
        Description = "Player not found or user not authorized")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerRecentPerformanceDto>>),
        Description = "Invalid player ID format")]
    public async Task<HttpResponseData> GetPlayerRecentPerformances(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}/recent-performances")] HttpRequestData req,
        string playerId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            _logger.LogWarning("Unauthorized access attempt to GetPlayerRecentPerformances");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<List<PlayerRecentPerformanceDto>>.ErrorResponse(
                "Authentication required", 401));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            _logger.LogWarning("Invalid playerId format: {PlayerId}", playerId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<PlayerRecentPerformanceDto>>.ErrorResponse(
                "Invalid player ID format", 400));
            return badRequestResponse;
        }

        // Parse optional limit parameter
        var limitStr = req.Query["limit"];
        int limit = 10; // default
        if (!string.IsNullOrEmpty(limitStr) && int.TryParse(limitStr, out var parsedLimit))
        {
            limit = Math.Max(1, Math.Min(parsedLimit, 50)); // Clamp between 1 and 50
        }

        // Check if player exists
        var playerExists = await _db.Players.AnyAsync(p => p.Id == playerGuid);
        if (!playerExists)
        {
            _logger.LogWarning("Player not found: {PlayerId}", playerGuid);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<List<PlayerRecentPerformanceDto>>.ErrorResponse(
                "Player not found", 404));
            return notFoundResponse;
        }

        // Get player performances (may be empty if player has no completed matches yet)
        var performances = await _mediator.Send(new GetPlayerRecentPerformancesQuery(playerGuid, azureUserId, limit));

        // Return 200 OK with performances (even if empty array)
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<PlayerRecentPerformanceDto>>.SuccessResponse(performances));
        return response;
    }
}
