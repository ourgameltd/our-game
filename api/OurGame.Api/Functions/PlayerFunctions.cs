using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.DTOs;
using OurGame.Application.UseCases.Players.Queries;
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
    /// Get player by ID
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="playerId">The player ID (GUID)</param>
    /// <returns>Detailed profile information about a specific player</returns>
    [Function("GetPlayerById")]
    [OpenApiOperation(operationId: "GetPlayerById", tags: new[] { "Players" }, Summary = "Get player by ID", Description = "Retrieves detailed profile information about a specific player")]
    [OpenApiParameter(name: "playerId", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The player ID (GUID)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerProfileDto>), Description = "Player retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerProfileDto>), Description = "Invalid player ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerProfileDto>), Description = "Player not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerProfileDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetPlayerById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}")] HttpRequestData req,
        string playerId)
    {
        try
        {
            if (!Guid.TryParse(playerId, out var playerGuid))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(ApiResponse<PlayerProfileDto>.ValidationErrorResponse("Invalid player ID format"));
                return badResponse;
            }

            var player = await _mediator.Send(new GetPlayerByIdQuery(playerGuid));
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<PlayerProfileDto>.SuccessResponse(player));
            return response;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Player not found: {PlayerId}", playerId);
            var response = req.CreateResponse(HttpStatusCode.NotFound);
            await response.WriteAsJsonAsync(ApiResponse<PlayerProfileDto>.NotFoundResponse(ex.Message));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving player: {PlayerId}", playerId);
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(ApiResponse<PlayerProfileDto>.ErrorResponse(
                "An error occurred while retrieving the player", 500));
            return response;
        }
    }

    /// <summary>
    /// Get player attributes
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="playerId">The player ID (GUID)</param>
    /// <returns>The 35 EA FC-style attributes for a specific player</returns>
    [Function("GetPlayerAttributes")]
    [OpenApiOperation(operationId: "GetPlayerAttributes", tags: new[] { "Players" }, Summary = "Get player attributes", Description = "Retrieves the 35 EA FC-style attributes for a specific player")]
    [OpenApiParameter(name: "playerId", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The player ID (GUID)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerAttributesDto>), Description = "Attributes retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerAttributesDto>), Description = "Invalid player ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerAttributesDto>), Description = "Player attributes not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerAttributesDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetPlayerAttributes(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}/attributes")] HttpRequestData req,
        string playerId)
    {
        try
        {
            if (!Guid.TryParse(playerId, out var playerGuid))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(ApiResponse<PlayerAttributesDto>.ValidationErrorResponse("Invalid player ID format"));
                return badResponse;
            }

            var attributes = await _mediator.Send(new GetPlayerAttributesQuery(playerGuid));
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<PlayerAttributesDto>.SuccessResponse(attributes));
            return response;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Player attributes not found: {PlayerId}", playerId);
            var response = req.CreateResponse(HttpStatusCode.NotFound);
            await response.WriteAsJsonAsync(ApiResponse<PlayerAttributesDto>.NotFoundResponse(ex.Message));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving player attributes: {PlayerId}", playerId);
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(ApiResponse<PlayerAttributesDto>.ErrorResponse(
                "An error occurred while retrieving player attributes", 500));
            return response;
        }
    }
}
