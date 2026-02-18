using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Teams;

/// <summary>
/// Azure Function for updating a coach's role on a team
/// </summary>
public class UpdateTeamCoachRoleFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateTeamCoachRoleFunction> _logger;

    public UpdateTeamCoachRoleFunction(IMediator mediator, ILogger<UpdateTeamCoachRoleFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update a coach's role on a team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <param name="coachId">The coach ID</param>
    /// <returns>The updated coach details</returns>
    [Function("UpdateTeamCoachRole")]
    [OpenApiOperation(
        operationId: "updateTeamCoachRole",
        tags: new[] { "Teams" },
        Summary = "Update coach role on team",
        Description = "Updates the role of a coach assigned to a team (e.g., promote AssistantCoach to HeadCoach).")]
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
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateTeamCoachRoleRequestDto),
        Required = true,
        Description = "Updated role details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamCoachDto>),
        Description = "Coach role updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamCoachDto>),
        Description = "Invalid request data or validation failure")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamCoachDto>),
        Description = "Team, coach, or coach assignment not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamCoachDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> UpdateTeamCoachRole(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/teams/{teamId}/coaches/{coachId}/role")] HttpRequestData req,
        string teamId,
        string coachId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateTeamCoachRole");
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

        if (!Guid.TryParse(coachId, out var coachGuid))
        {
            _logger.LogWarning("Invalid coachId format: {CoachId}", coachId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.ErrorResponse(
                "Invalid coach ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var request = await req.ReadFromJsonAsync<UpdateTeamCoachRoleRequestDto>();
        if (request == null)
        {
            _logger.LogWarning("Failed to deserialize UpdateTeamCoachRoleRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var command = new UpdateTeamCoachRoleCommand(teamGuid, coachGuid, request);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Coach {CoachId} role updated on team {TeamId} successfully", coachGuid, teamGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateTeamCoachRole");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateTeamCoachRole");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating coach role on team");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TeamCoachDto>.ErrorResponse(
                "An error occurred while updating the coach role",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
