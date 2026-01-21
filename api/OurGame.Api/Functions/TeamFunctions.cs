using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Application.Abstractions.Responses;
using OurGame.Api.Extensions;
using System.Net;
using OurGame.Application.UseCases.Teams.Queries.GetMyTeamsAndClubs.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetMyTeamsAndClubs;

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
    /// Get teams accessible for the current user (coach assignments)
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>List of teams the user has access to</returns>
    [Function("GetMyTeams")]
    [OpenApiOperation(operationId: "GetMyTeams", tags: new[] { "Teams" }, Summary = "Get my teams", Description = "Retrieves teams the current user has access to via coach assignments")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamAndClubsListItemDto>>), Description = "Teams retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamAndClubsListItemDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamAndClubsListItemDto>>), Description = "User profile not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamAndClubsListItemDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetMyTeams(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/me")] HttpRequestData req)
    {
            var azureUserId = req.GetUserId();

            if (string.IsNullOrEmpty(azureUserId))
            {
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            var teams = await _mediator.Send(new GetMyTeamsAndClubsQuery(azureUserId));

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<List<TeamAndClubsListItemDto>>.SuccessResponse(teams));
            return response;
    }
}
