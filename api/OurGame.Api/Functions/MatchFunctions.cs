using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Matches.DTOs;
using OurGame.Application.UseCases.Matches.Queries;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Match endpoints
/// </summary>
public class MatchFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<MatchFunctions> _logger;

    public MatchFunctions(IMediator mediator, ILogger<MatchFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get match by ID
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="matchId">The match ID (GUID)</param>
    /// <returns>Detailed information about a specific match</returns>
    [Function("GetMatchById")]
    [OpenApiOperation(operationId: "GetMatchById", tags: new[] { "Matches" }, Summary = "Get match by ID", Description = "Retrieves detailed information about a specific match")]
    [OpenApiParameter(name: "matchId", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The match ID (GUID)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<MatchDto>), Description = "Match retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<MatchDto>), Description = "Invalid match ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<MatchDto>), Description = "Match not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<MatchDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetMatchById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/matches/{matchId}")] HttpRequestData req,
        string matchId)
    {
        try
        {
            if (!Guid.TryParse(matchId, out var matchGuid))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(ApiResponse<MatchDto>.ValidationErrorResponse("Invalid match ID format"));
                return badResponse;
            }

            var match = await _mediator.Send(new GetMatchByIdQuery(matchGuid));
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<MatchDto>.SuccessResponse(match));
            return response;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Match not found: {MatchId}", matchId);
            var response = req.CreateResponse(HttpStatusCode.NotFound);
            await response.WriteAsJsonAsync(ApiResponse<MatchDto>.NotFoundResponse(ex.Message));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving match: {MatchId}", matchId);
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(ApiResponse<MatchDto>.ErrorResponse(
                "An error occurred while retrieving the match", 500));
            return response;
        }
    }

    /// <summary>
    /// Get match lineup
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="matchId">The match ID (GUID)</param>
    /// <returns>The lineup (starting players and substitutes) for a specific match</returns>
    [Function("GetMatchLineup")]
    [OpenApiOperation(operationId: "GetMatchLineup", tags: new[] { "Matches" }, Summary = "Get match lineup", Description = "Retrieves the lineup (starting players and substitutes) for a specific match")]
    [OpenApiParameter(name: "matchId", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The match ID (GUID)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<MatchLineupDto>), Description = "Lineup retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<MatchLineupDto>), Description = "Invalid match ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<MatchLineupDto>), Description = "Match lineup not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<MatchLineupDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetMatchLineup(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/matches/{matchId}/lineup")] HttpRequestData req,
        string matchId)
    {
        try
        {
            if (!Guid.TryParse(matchId, out var matchGuid))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(ApiResponse<MatchLineupDto>.ValidationErrorResponse("Invalid match ID format"));
                return badResponse;
            }

            var lineup = await _mediator.Send(new GetMatchLineupQuery(matchGuid));
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<MatchLineupDto>.SuccessResponse(lineup));
            return response;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Match lineup not found: {MatchId}", matchId);
            var response = req.CreateResponse(HttpStatusCode.NotFound);
            await response.WriteAsJsonAsync(ApiResponse<MatchLineupDto>.NotFoundResponse(ex.Message));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving match lineup: {MatchId}", matchId);
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteAsJsonAsync(ApiResponse<MatchLineupDto>.ErrorResponse(
                "An error occurred while retrieving the match lineup", 500));
            return response;
        }
    }
}
