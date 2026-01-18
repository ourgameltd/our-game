using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Clubs.DTOs;
using OurGame.Application.UseCases.Clubs.Queries;
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
    [OpenApiOperation(operationId: "GetAgeGroupsByClubId", tags: new[] { "Age Groups" }, Summary = "Get age groups by club", Description = "Retrieves all age groups for a specific club with optional filters")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The club ID (GUID)")]
    [OpenApiParameter(name: "includeArchived", In = ParameterLocation.Query, Required = false, Type = typeof(bool), Description = "Include archived age groups (default: false)")]
    [OpenApiParameter(name: "season", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by season (e.g., '2024/25')")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupListItemDto>>), Description = "Age groups retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupListItemDto>>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupListItemDto>>), Description = "Club not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<AgeGroupListItemDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetAgeGroupsByClubId(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/age-groups")] HttpRequestData req,
        string clubId)
    {
        try
        {
            if (!Guid.TryParse(clubId, out var clubGuid))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(ApiResponse<List<AgeGroupListItemDto>>.ValidationErrorResponse("Invalid club ID format"));
                return badResponse;
            }

            // Parse query parameters
            var queryParams = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var includeArchived = bool.TryParse(queryParams["includeArchived"], out var archived) && archived;
            var season = queryParams["season"];

            var ageGroups = await _mediator.Send(new GetClubAgeGroupsQuery(clubGuid, includeArchived, season));
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<List<AgeGroupListItemDto>>.SuccessResponse(ageGroups));
            return response;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Club not found: {ClubId}", clubId);
            var response = req.CreateResponse(HttpStatusCode.NotFound);
            await response.WriteAsJsonAsync(ApiResponse<List<AgeGroupListItemDto>>.NotFoundResponse(ex.Message));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving age groups for club: {ClubId}", clubId);
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(ApiResponse<List<AgeGroupListItemDto>>.ErrorResponse(
                "An error occurred while retrieving age groups", 500));
            return response;
        }
    }
}
