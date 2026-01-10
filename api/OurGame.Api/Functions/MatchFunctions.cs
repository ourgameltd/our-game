using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using OurGame.Application.Abstractions.Exceptions;
using Swashbuckle.AspNetCore.Annotations;
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
    /// <response code="200">Match retrieved successfully</response>
    /// <response code="400">Invalid match ID format</response>
    /// <response code="404">Match not found</response>
    /// <response code="500">Internal server error</response>
    [Function("GetMatchById")]
    [SwaggerOperation(OperationId = "GetMatchById", Tags = new[] { "Matches" }, Summary = "Get match by ID", Description = "Retrieves detailed information about a specific match")]
    [SwaggerResponse(200, "Match retrieved successfully", typeof(ApiResponse<MatchDto>))]
    [SwaggerResponse(400, "Invalid match ID format", typeof(ApiResponse<MatchDto>))]
    [SwaggerResponse(404, "Match not found", typeof(ApiResponse<MatchDto>))]
    [SwaggerResponse(500, "Internal server error", typeof(ApiResponse<MatchDto>))]
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
    /// <response code="200">Lineup retrieved successfully</response>
    /// <response code="400">Invalid match ID format</response>
    /// <response code="404">Match lineup not found</response>
    /// <response code="500">Internal server error</response>
    [Function("GetMatchLineup")]
    [SwaggerOperation(OperationId = "GetMatchLineup", Tags = new[] { "Matches" }, Summary = "Get match lineup", Description = "Retrieves the lineup (starting players and substitutes) for a specific match")]
    [SwaggerResponse(200, "Lineup retrieved successfully", typeof(ApiResponse<MatchLineupDto>))]
    [SwaggerResponse(400, "Invalid match ID format", typeof(ApiResponse<MatchLineupDto>))]
    [SwaggerResponse(404, "Match lineup not found", typeof(ApiResponse<MatchLineupDto>))]
    [SwaggerResponse(500, "Internal server error", typeof(ApiResponse<MatchLineupDto>))]
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
