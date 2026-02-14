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

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Player endpoints
/// </summary>
public class PlayerFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<PlayerFunctions> _logger;

    public PlayerFunctions(IMediator mediator, ILogger<PlayerFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get player details by ID
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="playerId">The player ID</param>
    /// <returns>Player detail information with denormalized club, age group, and team context</returns>
    [Function("GetPlayerById")]
    [OpenApiOperation(operationId: "GetPlayerById", tags: new[] { "Players" }, Summary = "Get player by ID", Description = "Retrieves player details including club context, all team and age group assignments, preferred positions, nickname, association ID, and archive status. Backward-compatible single-value fields (TeamId, AgeGroupId, PreferredPosition) are derived from the first assignment.")]
    [OpenApiParameter(name: "playerId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The player ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerDto>), Description = "Player retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerDto>), Description = "Player not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerDto>), Description = "Invalid player ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetPlayerById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}")] HttpRequestData req,
        string playerId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                "Invalid player ID format", 400));
            return badRequestResponse;
        }

        var player = await _mediator.Send(new GetPlayerByIdQuery(playerGuid));

        if (player == null)
        {
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
