using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerById;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerById.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for updating an existing player's settings
/// </summary>
public class UpdatePlayerFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdatePlayerFunction> _logger;

    public UpdatePlayerFunction(IMediator mediator, ILogger<UpdatePlayerFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing player's settings
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="playerId">The player ID</param>
    /// <returns>The updated player</returns>
    [Function("UpdatePlayer")]
    [OpenApiOperation(
        operationId: "UpdatePlayer",
        tags: new[] { "Players" },
        Summary = "Update player settings",
        Description = "Updates an existing player's personal details, preferred positions, and team assignments.")]
    [OpenApiParameter(
        name: "playerId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The player identifier (UUID)")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdatePlayerRequestDto),
        Required = true,
        Description = "Updated player details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerDto>),
        Description = "Player updated successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.BadRequest,
        Description = "Invalid request data or validation failure")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NotFound,
        Description = "Player not found")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    public async Task<HttpResponseData> UpdatePlayer(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/players/{playerId}")] HttpRequestData req,
        string playerId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdatePlayer");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            _logger.LogWarning("Invalid playerId format: {PlayerId}", playerId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                "Invalid player ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var dto = await req.ReadFromJsonAsync<UpdatePlayerRequestDto>();
        if (dto == null)
        {
            _logger.LogWarning("Failed to deserialize UpdatePlayerRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var command = new UpdatePlayerCommand(playerGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Player updated successfully: {PlayerId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdatePlayer");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdatePlayer");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
    }
}
