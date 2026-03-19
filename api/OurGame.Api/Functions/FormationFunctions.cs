using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Formations.Queries.GetSystemFormations;
using OurGame.Application.UseCases.Formations.Queries.GetSystemFormations.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for formation endpoints.
/// </summary>
public class FormationFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<FormationFunctions> _logger;

    public FormationFunctions(IMediator mediator, ILogger<FormationFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all read-only system formations.
    /// </summary>
    [Function("GetSystemFormations")]
    [OpenApiOperation(
        operationId: "GetSystemFormations",
        tags: new[] { "Formations" },
        Summary = "Get system formations",
        Description = "Retrieves read-only system formations with ordered positions for tactic creation and editing")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<SystemFormationDto>>),
        Description = "System formations retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<SystemFormationDto>>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<List<SystemFormationDto>>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetSystemFormations(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/formations/system")] HttpRequestData req)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            _logger.LogWarning("Unauthorized access attempt to GetSystemFormations");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<List<SystemFormationDto>>.ErrorResponse(
                "Authentication required", (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        var formations = await _mediator.Send(new GetSystemFormationsQuery());

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<SystemFormationDto>>.SuccessResponse(formations));
        return response;
    }
}