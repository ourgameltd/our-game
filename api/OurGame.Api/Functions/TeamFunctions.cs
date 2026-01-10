using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.DTOs;
using OurGame.Application.UseCases.Teams.Queries;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Team endpoints
/// </summary>
public class TeamFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<TeamFunctions> _logger;

    public TeamFunctions(IMediator mediator, ILogger<TeamFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get team by ID
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID (GUID)</param>
    /// <returns>Detailed information about a specific team</returns>
    [Function("GetTeamById")]
    [OpenApiOperation(operationId: "GetTeamById", tags: new[] { "Teams" }, Summary = "Get team by ID", Description = "Retrieves detailed information about a specific team")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The team ID (GUID)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<TeamDetailDto>), Description = "Team retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<TeamDetailDto>), Description = "Invalid team ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<TeamDetailDto>), Description = "Team not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<TeamDetailDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTeamById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/{teamId}")] HttpRequestData req,
        string teamId)
    {
        try
        {
            if (!Guid.TryParse(teamId, out var teamGuid))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(ApiResponse<TeamDetailDto>.ValidationErrorResponse("Invalid team ID format"));
                return badResponse;
            }

            var team = await _mediator.Send(new GetTeamByIdQuery(teamGuid));
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<TeamDetailDto>.SuccessResponse(team));
            return response;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Team not found: {TeamId}", teamId);
            var response = req.CreateResponse(HttpStatusCode.NotFound);
            await response.WriteAsJsonAsync(ApiResponse<TeamDetailDto>.NotFoundResponse(ex.Message));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving team: {TeamId}", teamId);
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(ApiResponse<TeamDetailDto>.ErrorResponse(
                "An error occurred while retrieving the team", 500));
            return response;
        }
    }

    /// <summary>
    /// Get team squad (players)
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID (GUID)</param>
    /// <returns>List of players in the team squad with squad numbers</returns>
    [Function("GetTeamSquad")]
    [OpenApiOperation(operationId: "GetTeamSquad", tags: new[] { "Teams" }, Summary = "Get team squad", Description = "Retrieves the squad list for a specific team with squad numbers")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The team ID (GUID)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamSquadPlayerDto>>), Description = "Squad retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamSquadPlayerDto>>), Description = "Invalid team ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamSquadPlayerDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetTeamSquad(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/{teamId}/squad")] HttpRequestData req,
        string teamId)
    {
        try
        {
            if (!Guid.TryParse(teamId, out var teamGuid))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(ApiResponse<List<TeamSquadPlayerDto>>.ValidationErrorResponse("Invalid team ID format"));
                return badResponse;
            }

            var squad = await _mediator.Send(new GetTeamSquadQuery(teamGuid));
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<List<TeamSquadPlayerDto>>.SuccessResponse(squad));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving team squad: {TeamId}", teamId);
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(ApiResponse<List<TeamSquadPlayerDto>>.ErrorResponse(
                "An error occurred while retrieving the team squad", 500));
            return response;
        }
    }
}
