using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerReports;
using OurGame.Application.UseCases.Players.Queries.GetPlayerReports.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for retrieving all report cards for a player
/// </summary>
public class GetPlayerReportsFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetPlayerReportsFunction> _logger;

    public GetPlayerReportsFunction(IMediator mediator, ILogger<GetPlayerReportsFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all report cards for a player
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="playerId">The player ID</param>
    /// <returns>List of report card summaries ordered by creation date</returns>
    [Function("GetPlayerReports")]
    [OpenApiOperation(
        operationId: "GetPlayerReports",
        tags: new[] { "Players" },
        Summary = "Get all report cards for a player",
        Description = "Retrieves all report cards for a player including overall ratings, coach info, and review periods. Returns reports ordered by most recent first. Access restricted to authorized users (coaches, the player, or parents).")]
    [OpenApiParameter(
        name: "playerId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The player ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerReportSummaryDto>>),
        Description = "Reports retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerReportSummaryDto>>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerReportSummaryDto>>),
        Description = "Player not found or user not authorized")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<PlayerReportSummaryDto>>),
        Description = "Invalid player ID format")]
    public async Task<HttpResponseData> GetPlayerReports(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}/reports")] HttpRequestData req,
        string playerId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            _logger.LogWarning("Unauthorized access attempt to GetPlayerReports");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<List<PlayerReportSummaryDto>>.ErrorResponse(
                "Authentication required", 401));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            _logger.LogWarning("Invalid playerId format: {PlayerId}", playerId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<PlayerReportSummaryDto>>.ErrorResponse(
                "Invalid player ID format", 400));
            return badRequestResponse;
        }

        var reports = await _mediator.Send(new GetPlayerReportsQuery(playerGuid, azureUserId));

        if (reports == null)
        {
            _logger.LogWarning("Player not found or unauthorized: {PlayerId}", playerGuid);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<List<PlayerReportSummaryDto>>.ErrorResponse(
                "Player not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<PlayerReportSummaryDto>>.SuccessResponse(reports));
        return response;
    }
}
