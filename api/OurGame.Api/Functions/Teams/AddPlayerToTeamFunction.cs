using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.AddPlayerToTeam;
using OurGame.Application.UseCases.Teams.Commands.AddPlayerToTeam.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Teams;

/// <summary>
/// Azure Function for adding a player to a team
/// </summary>
public class AddPlayerToTeamFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<AddPlayerToTeamFunction> _logger;

    public AddPlayerToTeamFunction(IMediator mediator, ILogger<AddPlayerToTeamFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Add a player to a team with a squad number
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>The player-team assignment details</returns>
    [Function("AddPlayerToTeam")]
    [OpenApiOperation(
        operationId: "AddPlayerToTeam",
        tags: new[] { "Teams" },
        Summary = "Add player to team",
        Description = "Adds a player to a team with a specified squad number")]
    [OpenApiParameter(
        name: "teamId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The team identifier")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(AddPlayerToTeamRequestDto),
        Required = true,
        Description = "Player assignment details including player ID and squad number")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<AddPlayerToTeamResultDto>),
        Description = "Player added to team successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.BadRequest,
        Description = "Invalid request data or validation failure (e.g., player already assigned, squad number already taken)")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NotFound,
        Description = "Team or player not found")]
    public async Task<HttpResponseData> AddPlayerToTeam(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/teams/{teamId}/players")] HttpRequestData req,
        string teamId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to AddPlayerToTeam");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            _logger.LogWarning("Invalid teamId format: {TeamId}", teamId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<AddPlayerToTeamResultDto>.ErrorResponse(
                "Invalid team ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var request = await req.ReadFromJsonAsync<AddPlayerToTeamRequestDto>();
        if (request == null)
        {
            _logger.LogWarning("Failed to deserialize AddPlayerToTeamRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<AddPlayerToTeamResultDto>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var command = new AddPlayerToTeamCommand(teamGuid, request.PlayerId, request.SquadNumber, userId);
        var result = await _mediator.Send(command);

        if (result.IsNotFound)
        {
            _logger.LogWarning("Resource not found during AddPlayerToTeam: {Message}", result.ErrorMessage);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<AddPlayerToTeamResultDto>.NotFoundResponse(
                result.ErrorMessage ?? "Resource not found"));
            return notFoundResponse;
        }

        if (result.IsFailure)
        {
            _logger.LogWarning("Validation error during AddPlayerToTeam: {Message}", result.ErrorMessage);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<AddPlayerToTeamResultDto>.ErrorResponse(
                result.ErrorMessage ?? "Validation failed",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        _logger.LogInformation("Player {PlayerId} added to team {TeamId} with squad number {SquadNumber}",
            request.PlayerId, teamGuid, request.SquadNumber);
        
        var successResponse = req.CreateResponse(HttpStatusCode.Created);
        successResponse.Headers.Add("Location", $"/v1/teams/{teamGuid}/players");
        await successResponse.WriteAsJsonAsync(ApiResponse<AddPlayerToTeamResultDto>.SuccessResponse(
            result.Value!,
            (int)HttpStatusCode.Created));
        return successResponse;
    }
}
