using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerSeasonStatistics;
using OurGame.Application.UseCases.Players.Queries.GetPlayerSeasonStatistics.DTOs;
using OurGame.Persistence.Models;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for retrieving per-season statistics for a player
/// </summary>
public class GetPlayerSeasonStatisticsFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetPlayerSeasonStatisticsFunction> _logger;
    private readonly OurGameContext _db;

    public GetPlayerSeasonStatisticsFunction(IMediator mediator, ILogger<GetPlayerSeasonStatisticsFunction> logger, OurGameContext db)
    {
        _mediator = mediator;
        _logger = logger;
        _db = db;
    }

    [Function("GetPlayerSeasonStatistics")]
    [OpenApiOperation(
        operationId: "GetPlayerSeasonStatistics",
        tags: new[] { "Players" },
        Summary = "Get player season statistics",
        Description = "Returns per-season aggregated match statistics and attendance for a player.")]
    [OpenApiParameter(
        name: "playerId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The player ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerSeasonStatisticsDto>>),
        Description = "Season statistics retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerSeasonStatisticsDto>>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerSeasonStatisticsDto>>),
        Description = "Player not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerSeasonStatisticsDto>>),
        Description = "Invalid player ID format")]
    public async Task<HttpResponseData> GetPlayerSeasonStatistics(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}/season-statistics")] HttpRequestData req,
        string playerId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<List<PlayerSeasonStatisticsDto>>.ErrorResponse(
                "Authentication required", 401));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<PlayerSeasonStatisticsDto>>.ErrorResponse(
                "Invalid player ID format", 400));
            return badRequestResponse;
        }

        var playerExists = await _db.Players.AnyAsync(p => p.Id == playerGuid);
        if (!playerExists)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<List<PlayerSeasonStatisticsDto>>.ErrorResponse(
                "Player not found", 404));
            return notFoundResponse;
        }

        var stats = await _mediator.Send(new GetPlayerSeasonStatisticsQuery(playerGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<PlayerSeasonStatisticsDto>>.SuccessResponse(stats));
        return response;
    }
}
