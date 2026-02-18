using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Application.Abstractions.Responses;
using OurGame.Api.Extensions;
using System.Net;
using OurGame.Application.UseCases.Teams.Queries.GetDevelopmentPlansByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetDevelopmentPlansByTeamId.DTOs;

namespace OurGame.Api.Functions.Teams;

/// <summary>
/// Azure Function for getting team development plans
/// </summary>
public class GetTeamDevelopmentPlansFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetTeamDevelopmentPlansFunction> _logger;

    public GetTeamDevelopmentPlansFunction(IMediator mediator, ILogger<GetTeamDevelopmentPlansFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get development plans for players in a specific team
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="teamId">The team ID</param>
    /// <returns>List of development plans for players in the team</returns>
    [Function("GetTeamDevelopmentPlans")]
    [OpenApiOperation(operationId: "GetTeamDevelopmentPlans", tags: new[] { "Teams", "DevelopmentPlans" }, Summary = "Get team development plans", Description = "Retrieves all development plans for players assigned to a specific team")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The team ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<TeamDevelopmentPlanDto>>), Description = "Development plans retrieved successfully")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.BadRequest, Description = "Invalid team ID format")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NotFound, Description = "Team not found")]
    public async Task<HttpResponseData> GetTeamDevelopmentPlans(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/teams/{teamId}/development-plans")] HttpRequestData req,
        string teamId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(teamId, out var teamGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<TeamDevelopmentPlanDto>>.ErrorResponse(
                "Invalid team ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var developmentPlans = await _mediator.Send(new GetDevelopmentPlansByTeamIdQuery(teamGuid));

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<List<TeamDevelopmentPlanDto>>.SuccessResponse(developmentPlans));
            return response;
        }
        catch (KeyNotFoundException)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<List<TeamDevelopmentPlanDto>>.ErrorResponse(
                "Team not found", 404));
            return notFoundResponse;
        }
    }
}
