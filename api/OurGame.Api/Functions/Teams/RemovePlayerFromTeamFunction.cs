using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.UseCases.Teams.Commands.RemovePlayerFromTeam;
using System.Net;

namespace OurGame.Api.Functions.Teams;

/// <summary>
/// Azure Function for removing a player from a team
/// </summary>
public class RemovePlayerFromTeamFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<RemovePlayerFromTeamFunction> _logger;

    public RemovePlayerFromTeamFunction(IMediator mediator, ILogger<RemovePlayerFromTeamFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Remove a player from a team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <param name="playerId">The player ID</param>
    /// <returns>No content on success</returns>
    [Function("RemovePlayerFromTeam")]
    [OpenApiOperation(
        operationId: "RemovePlayerFromTeam",
        tags: new[] { "Teams" },
        Summary = "Remove player from team",
        Description = "Removes a player's assignment from a team.")]
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
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NoContent,
        Description = "Player removed from team successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.BadRequest,
        Description = "Invalid request data (e.g., invalid GUID format)")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NotFound,
        Description = "Player assignment not found")]
    public async Task<HttpResponseData> RemovePlayerFromTeam(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "v1/teams/{teamId}/players/{playerId}")] HttpRequestData req,
        string teamId,
        string playerId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to RemovePlayerFromTeam");
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            _logger.LogWarning("Invalid teamId format: {TeamId}", teamId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(new { error = "Invalid team ID format" });
            return badRequestResponse;
        }

        if (!Guid.TryParse(playerId, out var playerGuid))
        {
            _logger.LogWarning("Invalid playerId format: {PlayerId}", playerId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(new { error = "Invalid player ID format" });
            return badRequestResponse;
        }

        var command = new RemovePlayerFromTeamCommand(teamGuid, playerGuid, userId);
        var result = await _mediator.Send(command);

        if (result.IsNotFound)
        {
            _logger.LogWarning("Player assignment not found for team {TeamId} and player {PlayerId}", teamGuid, playerGuid);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(new { error = result.ErrorMessage });
            return notFoundResponse;
        }

        if (result.IsFailure)
        {
            _logger.LogWarning("Failed to remove player {PlayerId} from team {TeamId}: {Error}", playerGuid, teamGuid, result.ErrorMessage);
            var failureResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await failureResponse.WriteAsJsonAsync(new { error = result.ErrorMessage });
            return failureResponse;
        }

        _logger.LogInformation("Player {PlayerId} removed from team {TeamId} successfully", playerGuid, teamGuid);
        return req.CreateResponse(HttpStatusCode.NoContent);
    }
}
