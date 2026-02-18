using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.RemoveCoachFromTeam;
using System.Net;

namespace OurGame.Api.Functions.Teams;

/// <summary>
/// Azure Function for removing a coach from a team
/// </summary>
public class RemoveTeamCoachFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<RemoveTeamCoachFunction> _logger;

    public RemoveTeamCoachFunction(IMediator mediator, ILogger<RemoveTeamCoachFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Remove a coach from a team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <param name="coachId">The coach ID</param>
    /// <returns>No content on success</returns>
    [Function("RemoveTeamCoach")]
    [OpenApiOperation(
        operationId: "removeTeamCoach",
        tags: new[] { "Teams" },
        Summary = "Remove coach from team",
        Description = "Removes a coach's assignment from a team.")]
    [OpenApiParameter(
        name: "teamId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The team identifier")]
    [OpenApiParameter(
        name: "coachId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The coach identifier")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NoContent,
        Description = "Coach removed from team successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.BadRequest,
        Description = "Invalid request data (e.g., invalid GUID format, archived team)")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NotFound,
        Description = "Team, coach, or coach assignment not found")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.InternalServerError,
        Description = "Internal server error")]
    public async Task<HttpResponseData> RemoveTeamCoach(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "v1/teams/{teamId}/coaches/{coachId}")] HttpRequestData req,
        string teamId,
        string coachId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to RemoveTeamCoach");
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            _logger.LogWarning("Invalid teamId format: {TeamId}", teamId);
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        if (!Guid.TryParse(coachId, out var coachGuid))
        {
            _logger.LogWarning("Invalid coachId format: {CoachId}", coachId);
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        try
        {
            var command = new RemoveCoachFromTeamCommand(teamGuid, coachGuid);
            await _mediator.Send(command);

            _logger.LogInformation("Coach {CoachId} removed from team {TeamId} successfully", coachGuid, teamGuid);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during RemoveTeamCoach");
            return req.CreateResponse(HttpStatusCode.NotFound);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during RemoveTeamCoach");
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing coach from team");
            return req.CreateResponse(HttpStatusCode.InternalServerError);
        }
    }
}
