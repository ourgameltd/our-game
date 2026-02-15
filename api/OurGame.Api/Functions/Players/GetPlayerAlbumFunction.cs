using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAlbum;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAlbum.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for retrieving a player's photo album
/// </summary>
public class GetPlayerAlbumFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetPlayerAlbumFunction> _logger;

    public GetPlayerAlbumFunction(IMediator mediator, ILogger<GetPlayerAlbumFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get player photo album
    /// </summary>
    [Function("GetPlayerAlbum")]
    [OpenApiOperation(
        operationId: "GetPlayerAlbum",
        tags: new[] { "Players" },
        Summary = "Get player photo album",
        Description = "Retrieves all photos in a player's album with captions, dates, and tags")]
    [OpenApiParameter(
        name: "playerId",
        In = Microsoft.OpenApi.Models.ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The player ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<GetPlayerAlbumDto>),
        Description = "Player album retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Invalid ID format")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Player not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "An unexpected error occurred")]
    public async Task<HttpResponseData> GetPlayerAlbum(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}/album")] HttpRequestData req,
        string playerId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to GetPlayerAlbum");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            _logger.LogWarning("Invalid player ID format: {PlayerId}", playerId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid player ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var query = new GetPlayerAlbumQuery(playerGuid);
            var result = await _mediator.Send(query);

            if (result == null)
            {
                _logger.LogWarning("Player not found: {PlayerId}", playerGuid);
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse("Player not found"));
                return notFoundResponse;
            }

            _logger.LogInformation("Player album retrieved successfully for player {PlayerId}", playerGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<GetPlayerAlbumDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during GetPlayerAlbum");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving player album for player {PlayerId}", playerGuid);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while retrieving the player album",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
