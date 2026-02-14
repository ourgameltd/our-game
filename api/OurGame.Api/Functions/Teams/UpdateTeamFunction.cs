using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeam;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeam.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Teams;

/// <summary>
/// Azure Function for updating an existing team
/// </summary>
public class UpdateTeamFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateTeamFunction> _logger;

    public UpdateTeamFunction(IMediator mediator, ILogger<UpdateTeamFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>The updated team</returns>
    [Function("UpdateTeam")]
    [OpenApiOperation(
        operationId: "updateTeam",
        tags: new[] { "Teams" },
        Summary = "Update a team",
        Description = "Updates an existing team with the provided details.")]
    [OpenApiParameter(
        name: "teamId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The team identifier")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateTeamRequestDto),
        Required = true,
        Description = "Updated team details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamOverviewTeamDto>),
        Description = "Team updated successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.BadRequest,
        Description = "Invalid request data or validation failure")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NotFound,
        Description = "Team not found")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.InternalServerError,
        Description = "Internal server error")]
    public async Task<HttpResponseData> UpdateTeam(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/teams/{teamId}")] HttpRequestData req,
        string teamId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateTeam");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            _logger.LogWarning("Invalid teamId format: {TeamId}", teamId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ErrorResponse(
                "Invalid team ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var request = await req.ReadFromJsonAsync<UpdateTeamRequestDto>();
        if (request == null)
        {
            _logger.LogWarning("Failed to deserialize UpdateTeamRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var command = new UpdateTeamCommand(teamGuid, request);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Team updated successfully: {TeamId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateTeam");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateTeam");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
    }
}
