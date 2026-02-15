using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Functions for Player Abilities endpoints
/// </summary>
public class GetPlayerAbilitiesFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetPlayerAbilitiesFunction> _logger;

    public GetPlayerAbilitiesFunction(IMediator mediator, ILogger<GetPlayerAbilitiesFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get player abilities including current attributes and evaluation history
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="playerId">The player ID</param>
    /// <returns>Player abilities with EA FC-style attributes and coach evaluations</returns>
    [Function("GetPlayerAbilities")]
    [OpenApiOperation(operationId: "GetPlayerAbilities", tags: new[] { "Players" }, Summary = "Get player abilities", Description = "Retrieves comprehensive player ability data including 35 EA FC-style attributes (pace, shooting, passing, dribbling, defending, physical, mental, technical) and the last 12 coach evaluations with historical attribute ratings. Used for player development tracking and report card generation.")]
    [OpenApiParameter(name: "playerId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The player ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerAbilitiesDto>), Description = "Player abilities retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerAbilitiesDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerAbilitiesDto>), Description = "Player not found or user does not have access")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerAbilitiesDto>), Description = "Invalid player ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerAbilitiesDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetPlayerAbilities(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}/abilities")] HttpRequestData req,
        string playerId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilitiesDto>.ErrorResponse(
                "User not authenticated", 401));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilitiesDto>.ErrorResponse(
                "Invalid player ID format", 400));
            return badRequestResponse;
        }

        var abilities = await _mediator.Send(new GetPlayerAbilitiesQuery(playerGuid, azureUserId));

        if (abilities == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<PlayerAbilitiesDto>.ErrorResponse(
                "Player not found or user does not have access", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<PlayerAbilitiesDto>.SuccessResponse(abilities));
        return response;
    }
}
