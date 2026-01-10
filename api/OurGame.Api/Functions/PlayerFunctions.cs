using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using OurGame.Application.Abstractions.Exceptions;
using Swashbuckle.AspNetCore.Annotations;
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
    /// <response code="200">Player retrieved successfully</response>
    /// <response code="400">Invalid player ID format</response>
    /// <response code="404">Player not found</response>
    /// <response code="500">Internal server error</response>
    [Function("GetPlayerById")]
    [SwaggerOperation(OperationId = "GetPlayerById", Tags = new[] { "Players" }, Summary = "Get player by ID", Description = "Retrieves detailed profile information about a specific player")]
    [SwaggerResponse(200, "Player retrieved successfully", typeof(ApiResponse<PlayerProfileDto>))]
    [SwaggerResponse(400, "Invalid player ID format", typeof(ApiResponse<PlayerProfileDto>))]
    [SwaggerResponse(404, "Player not found", typeof(ApiResponse<PlayerProfileDto>))]
    [SwaggerResponse(500, "Internal server error", typeof(ApiResponse<PlayerProfileDto>))]
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
    /// <response code="200">Attributes retrieved successfully</response>
    /// <response code="400">Invalid player ID format</response>
    /// <response code="404">Player attributes not found</response>
    /// <response code="500">Internal server error</response>
    [Function("GetPlayerAttributes")]
    [SwaggerOperation(OperationId = "GetPlayerAttributes", Tags = new[] { "Players" }, Summary = "Get player attributes", Description = "Retrieves the 35 EA FC-style attributes for a specific player")]
    [SwaggerResponse(200, "Attributes retrieved successfully", typeof(ApiResponse<PlayerAttributesDto>))]
    [SwaggerResponse(400, "Invalid player ID format", typeof(ApiResponse<PlayerAttributesDto>))]
    [SwaggerResponse(404, "Player attributes not found", typeof(ApiResponse<PlayerAttributesDto>))]
    [SwaggerResponse(500, "Internal server error", typeof(ApiResponse<PlayerAttributesDto>))]
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
