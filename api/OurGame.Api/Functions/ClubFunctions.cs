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
/// Azure Functions for Club endpoints
/// </summary>
public class ClubFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<ClubFunctions> _logger;

    public ClubFunctions(IMediator mediator, ILogger<ClubFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all clubs
    /// </summary>
    /// <returns>List of all clubs the user has access to</returns>
    [Function("GetAllClubs")]
    [OpenApiOperation(operationId: "GetAllClubs", tags: new[] { "Clubs" }, Summary = "Get all clubs", Description = "Retrieves a list of all clubs the user has access to")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubSummaryDto>>), Description = "List of clubs retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubSummaryDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetAllClubs(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs")] HttpRequestData req)
    {
        try
        {
            var clubs = await _mediator.Send(new GetAllClubsQuery());
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<List<ClubSummaryDto>>.SuccessResponse(clubs));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all clubs");
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(ApiResponse<List<ClubSummaryDto>>.ErrorResponse(
                "An error occurred while retrieving clubs", 500));
            return response;
        }
    }

    /// <summary>
    /// Get club by ID
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID (GUID)</param>
    /// <returns>Detailed information about a specific club</returns>
    [Function("GetClubById")]
    [OpenApiOperation(operationId: "GetClubById", tags: new[] { "Clubs" }, Summary = "Get club by ID", Description = "Retrieves detailed information about a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The club ID (GUID)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<ClubDetailDto>), Description = "Club retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubDetailDto>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<ClubDetailDto>), Description = "Club not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<ClubDetailDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}")] HttpRequestData req,
        string clubId)
    {
        try
        {
            if (!Guid.TryParse(clubId, out var clubGuid))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.ValidationErrorResponse("Invalid club ID format"));
                return badResponse;
            }

            var club = await _mediator.Send(new GetClubByIdQuery(clubGuid));
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.SuccessResponse(club));
            return response;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Club not found: {ClubId}", clubId);
            var response = req.CreateResponse(HttpStatusCode.NotFound);
            await response.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.NotFoundResponse(ex.Message));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving club: {ClubId}", clubId);
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.ErrorResponse(
                "An error occurred while retrieving the club", 500));
            return response;
        }
    }
}
