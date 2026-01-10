using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using OurGame.Application.Abstractions.Responses;
using Swashbuckle.AspNetCore.Annotations;
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
    /// <response code="200">Age groups retrieved successfully</response>
    /// <response code="400">Invalid club ID format</response>
    /// <response code="500">Internal server error</response>
    [Function("GetAgeGroupsByClubId")]
    [SwaggerOperation(OperationId = "GetAgeGroupsByClubId", Tags = new[] { "Age Groups" }, Summary = "Get age groups by club", Description = "Retrieves all age groups for a specific club")]
    [SwaggerResponse(200, "Age groups retrieved successfully", typeof(ApiResponse<List<AgeGroupDto>>))]
    [SwaggerResponse(400, "Invalid club ID format", typeof(ApiResponse<List<AgeGroupDto>>))]
    [SwaggerResponse(500, "Internal server error", typeof(ApiResponse<List<AgeGroupDto>>))]
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
