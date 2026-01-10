using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.AgeGroups.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Age Group endpoints
/// </summary>
public class AgeGroupFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<AgeGroupFunctions> _logger;

    public AgeGroupFunctions(IMediator mediator, ILogger<AgeGroupFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all age groups for a club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID (GUID)</param>
    /// <returns>List of age groups for the specified club</returns>
    [Function("GetAgeGroupsByClubId")]
    [OpenApiOperation(operationId: "GetAgeGroupsByClubId", tags: new[] { "Age Groups" }, Summary = "Get age groups by club", Description = "Retrieves all age groups for a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The club ID (GUID)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupDto>>), Description = "Age groups retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupDto>>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetAgeGroupsByClubId(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/age-groups")] HttpRequestData req,
        string clubId)
    {
        try
        {
            if (!Guid.TryParse(clubId, out var clubGuid))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(ApiResponse<List<AgeGroupDto>>.ValidationErrorResponse("Invalid club ID format"));
                return badResponse;
            }

            var ageGroups = await _mediator.Send(new GetAgeGroupsByClubIdQuery(clubGuid));
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<List<AgeGroupDto>>.SuccessResponse(ageGroups));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving age groups for club: {ClubId}", clubId);
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(ApiResponse<List<AgeGroupDto>>.ErrorResponse(
                "An error occurred while retrieving age groups", 500));
            return response;
        }
    }
}
