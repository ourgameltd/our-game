using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for retrieving player details by ID
/// </summary>
public class GetPlayerByIdFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetPlayerByIdFunction> _logger;

    public GetPlayerByIdFunction(IMediator mediator, ILogger<GetPlayerByIdFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get player details by ID with authorization checks
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="playerId">The player ID</param>
    /// <returns>Player detail information with full profile data</returns>
    [Function("GetPlayerById")]
    [OpenApiOperation(
        operationId: "GetPlayerById",
        tags: new[] { "Players" },
        Summary = "Get player by ID",
        Description = "Retrieves comprehensive player profile including basic info, medical conditions, team assignments, and performance stats. Access is restricted to authorized users (coaches, the player, or parents).")]
    [OpenApiParameter(
        name: "playerId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The player ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerDto>),
        Description = "Player retrieved successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NotFound,
        Description = "Player not found or user not authorized")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.BadRequest,
        Description = "Invalid player ID format")]
    public async Task<HttpResponseData> GetPlayerById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}")] HttpRequestData req,
        string playerId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            _logger.LogWarning("Unauthorized access attempt to GetPlayerById");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                "Authentication required", 401));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            _logger.LogWarning("Invalid playerId format: {PlayerId}", playerId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                "Invalid player ID format", 400));
            return badRequestResponse;
        }

        var player = await _mediator.Send(new GetPlayerByIdQuery(playerGuid, azureUserId));

        if (player == null)
        {
            _logger.LogWarning("Player not found or unauthorized: {PlayerId}", playerGuid);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                "Player not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<PlayerDto>.SuccessResponse(player));
        return response;
    }
}
