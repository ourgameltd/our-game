using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.AssignCoachToTeam;
using OurGame.Application.UseCases.Teams.Commands.AssignCoachToTeam.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Teams;

/// <summary>
/// Azure Function for assigning a coach to a team
/// </summary>
public class AssignTeamCoachFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<AssignTeamCoachFunction> _logger;

    public AssignTeamCoachFunction(IMediator mediator, ILogger<AssignTeamCoachFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Assign a coach to a team with a specific role
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>The assigned coach details</returns>
    [Function("AssignTeamCoach")]
    [OpenApiOperation(
        operationId: "assignTeamCoach",
        tags: new[] { "Teams" },
        Summary = "Assign coach to team",
        Description = "Assigns a coach to a team with a specific role (e.g., HeadCoach, AssistantCoach).")]
    [OpenApiParameter(
        name: "teamId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The team identifier")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(AssignCoachToTeamRequestDto),
        Required = true,
        Description = "Coach assignment details including coach ID and role")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamCoachDto>),
        Description = "Coach assigned successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamCoachDto>),
        Description = "Invalid request data or validation failure (e.g., coach already assigned, archived team/coach, club mismatch)")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamCoachDto>),
        Description = "Team or coach not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamCoachDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> AssignTeamCoach(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/teams/{teamId}/coaches")] HttpRequestData req,
        string teamId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to AssignTeamCoach");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            _logger.LogWarning("Invalid teamId format: {TeamId}", teamId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.ErrorResponse(
                "Invalid team ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var request = await req.ReadFromJsonAsync<AssignCoachToTeamRequestDto>();
        if (request == null)
        {
            _logger.LogWarning("Failed to deserialize AssignCoachToTeamRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var command = new AssignCoachToTeamCommand(teamGuid, request);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Coach {CoachId} assigned to team {TeamId} successfully", result.Id, teamGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            successResponse.Headers.Add("Location", $"/v1/teams/{teamGuid}/coaches");
            await successResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during AssignTeamCoach");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during AssignTeamCoach");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning coach to team");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.ErrorResponse(
                "An error occurred while assigning the coach to the team",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
