using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamPlayerSquadNumber;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamPlayerSquadNumber.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Teams;

/// <summary>
/// Azure Function for updating a player's squad number on a team
/// </summary>
public class UpdateTeamPlayerSquadNumberFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateTeamPlayerSquadNumberFunction> _logger;

    public UpdateTeamPlayerSquadNumberFunction(IMediator mediator, ILogger<UpdateTeamPlayerSquadNumberFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update a player's squad number on a team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <param name="playerId">The player ID</param>
    /// <returns>Success or error response</returns>
    [Function("UpdateTeamPlayerSquadNumber")]
    [OpenApiOperation(
        operationId: "UpdateTeamPlayerSquadNumber",
        tags: new[] { "Teams" },
        Summary = "Update player's squad number",
        Description = "Updates the squad number of a player assigned to a team.")]
    [OpenApiParameter(
        name: "teamId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The team identifier")]
    [OpenApiParameter(
        name: "playerId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The player identifier")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateTeamPlayerSquadNumberRequestDto),
        Required = true,
        Description = "New squad number details")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.OK,
        Description = "Squad number updated successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.BadRequest,
        Description = "Invalid request data or squad number already in use")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NotFound,
        Description = "Player assignment not found")]
    public async Task<HttpResponseData> UpdateTeamPlayerSquadNumber(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/teams/{teamId}/players/{playerId}/squad-number")] HttpRequestData req,
        string teamId,
        string playerId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateTeamPlayerSquadNumber");
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            _logger.LogWarning("Invalid teamId format: {TeamId}", teamId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteStringAsync("Invalid team ID format");
            return badRequestResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            _logger.LogWarning("Invalid playerId format: {PlayerId}", playerId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteStringAsync("Invalid player ID format");
            return badRequestResponse;
        }

        var request = await req.ReadFromJsonAsync<UpdateTeamPlayerSquadNumberRequestDto>();
        if (request == null)
        {
            _logger.LogWarning("Failed to deserialize UpdateTeamPlayerSquadNumberRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteStringAsync("Invalid request body");
            return badRequestResponse;
        }

        var command = new UpdateTeamPlayerSquadNumberCommand(teamGuid, playerGuid, request.SquadNumber, userId);
        var result = await _mediator.Send(command);

        if (result.IsNotFound)
        {
            _logger.LogWarning("Player {PlayerId} not found in team {TeamId}", playerGuid, teamGuid);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteStringAsync(result.ErrorMessage ?? "Player assignment not found");
            return notFoundResponse;
        }

        if (result.IsFailure)
        {
            _logger.LogWarning("Failed to update squad number: {Error}", result.ErrorMessage);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteStringAsync(result.ErrorMessage ?? "Failed to update squad number");
            return badRequestResponse;
        }

        _logger.LogInformation("Squad number updated successfully for player {PlayerId} in team {TeamId}", playerGuid, teamGuid);
        return req.CreateResponse(HttpStatusCode.OK);
    }
}
