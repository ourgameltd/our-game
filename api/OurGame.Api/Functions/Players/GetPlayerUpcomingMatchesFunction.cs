using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerUpcomingMatches;
using OurGame.Application.UseCases.Players.Queries.GetPlayerUpcomingMatches.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for retrieving upcoming matches for a player
/// </summary>
public class GetPlayerUpcomingMatchesFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetPlayerUpcomingMatchesFunction> _logger;

    public GetPlayerUpcomingMatchesFunction(IMediator mediator, ILogger<GetPlayerUpcomingMatchesFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get upcoming matches for a player
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="playerId">The player ID</param>
    /// <returns>List of upcoming matches for the player's teams</returns>
    [Function("GetPlayerUpcomingMatches")]
    [OpenApiOperation(
        operationId: "GetPlayerUpcomingMatches",
        tags: new[] { "Players" },
        Summary = "Get player upcoming matches",
        Description = "Retrieves upcoming scheduled matches for all teams the player is assigned to. Returns matches ordered by date (soonest first). Access is restricted to authorized users (coaches, the player, or parents).")]
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
        Description = "Maximum number of matches to return (default: 5)")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerUpcomingMatchDto>>),
        Description = "Upcoming matches retrieved successfully (empty array if no upcoming matches)")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerUpcomingMatchDto>>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerUpcomingMatchDto>>),
        Description = "Player not found or user not authorized")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerUpcomingMatchDto>>),
        Description = "Invalid player ID format")]
    public async Task<HttpResponseData> GetPlayerUpcomingMatches(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}/upcoming-matches")] HttpRequestData req,
        string playerId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            _logger.LogWarning("Unauthorized access attempt to GetPlayerUpcomingMatches");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<List<PlayerUpcomingMatchDto>>.ErrorResponse(
                "Authentication required", 401));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            _logger.LogWarning("Invalid playerId format: {PlayerId}", playerId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<PlayerUpcomingMatchDto>>.ErrorResponse(
                "Invalid player ID format", 400));
            return badRequestResponse;
        }

        // Parse optional limit query parameter
        int? limit = null;
        var limitParam = req.GetQueryParam("limit");
        if (!string.IsNullOrEmpty(limitParam) && int.TryParse(limitParam, out var parsedLimit))
        {
            limit = parsedLimit;
        }

        var matches = await _mediator.Send(new GetPlayerUpcomingMatchesQuery(playerGuid, azureUserId, limit));

        if (matches == null)
        {
            _logger.LogWarning("Player not found or unauthorized: {PlayerId}", playerGuid);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<List<PlayerUpcomingMatchDto>>.ErrorResponse(
                "Player not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<PlayerUpcomingMatchDto>>.SuccessResponse(matches));
        return response;
    }
}
