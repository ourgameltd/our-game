using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupDevelopmentPlans;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupDevelopmentPlans.DTOs;
using System.Net;

namespace OurGame.Api.Functions.AgeGroups;

/// <summary>
/// Azure Function for retrieving development plans by age group
/// </summary>
public class GetAgeGroupDevelopmentPlansFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetAgeGroupDevelopmentPlansFunction> _logger;

    public GetAgeGroupDevelopmentPlansFunction(IMediator mediator, ILogger<GetAgeGroupDevelopmentPlansFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all development plans for players in a specific age group
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="ageGroupId">The age group ID</param>
    /// <returns>List of development plan summaries with player details</returns>
    [Function("GetAgeGroupDevelopmentPlans")]
    [OpenApiOperation(operationId: "GetAgeGroupDevelopmentPlans", tags: new[] { "AgeGroups", "DevelopmentPlans" }, Summary = "Get development plans by age group", Description = "Returns all development plans for players in the specified age group with player details and goals")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The age group identifier")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupDevelopmentPlanSummaryDto>>), Description = "Successfully retrieved development plans")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.BadRequest, Description = "Invalid age group ID format")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    public async Task<HttpResponseData> GetAgeGroupDevelopmentPlans(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/age-groups/{ageGroupId}/development-plans")] HttpRequestData req,
        string ageGroupId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(ageGroupId, out var ageGroupGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<AgeGroupDevelopmentPlanSummaryDto>>.ErrorResponse(
                "Invalid age group ID format", 400));
            return badRequestResponse;
        }

        var developmentPlans = await _mediator.Send(new GetAgeGroupDevelopmentPlansQuery(ageGroupGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<AgeGroupDevelopmentPlanSummaryDto>>.SuccessResponse(developmentPlans));
        return response;
    }
}
