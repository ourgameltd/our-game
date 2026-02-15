using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch.DTOs;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch.DTOs;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById.DTOs;
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
    /// Get a match by ID with full detail
    /// </summary>
    [Function("GetMatchById")]
    [OpenApiOperation(
        operationId: "GetMatchById",
        tags: new[] { "Matches" },
        Summary = "Get match by ID",
        Description = "Retrieves full match detail including lineup, coaches, report, goals, cards, substitutions, injuries, and performance ratings")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Invalid match ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetMatchById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/matches/{id}")] HttpRequestData req,
        string id)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Invalid match ID format", 400));
            return badRequestResponse;
        }

        var match = await _mediator.Send(new GetMatchByIdQuery(matchGuid, azureUserId));

        if (match == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Match not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.SuccessResponse(match));
        return response;
    }

    /// <summary>
    /// Get a match report by match ID with authorization check
    /// </summary>
    [Function("GetMatchReport")]
    [OpenApiOperation(
        operationId: "GetMatchReport",
        tags: new[] { "Matches" },
        Summary = "Get match report by match ID",
        Description = "Retrieves full match report with authorization check. User must be associated with one of the teams (coach, player, or parent).")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match report retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match not found or user not authorized")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Invalid match ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetMatchReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/matches/{id}/report")] HttpRequestData req,
        string id)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Invalid match ID format", 400));
            return badRequestResponse;
        }

        var match = await _mediator.Send(new GetMatchByIdQuery(matchGuid, azureUserId));

        if (match == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Match not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.SuccessResponse(match));
        return response;
    }

    /// <summary>
    /// Create a new match
    /// </summary>
    [Function("CreateMatch")]
    [OpenApiOperation(
        operationId: "CreateMatch",
        tags: new[] { "Matches" },
        Summary = "Create a new match",
        Description = "Creates a new match with optional lineup, coaches, substitutions, and match report including goals, cards, injuries, and performance ratings.")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreateMatchRequest),
        Required = true,
        Description = "Match creation details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match created successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Referenced resource not found (team, player, etc.)")]
    public async Task<HttpResponseData> CreateMatch(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/matches")] HttpRequestData req)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreateMatch");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<CreateMatchRequest>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize CreateMatchRequest");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreateMatchCommand(dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Match created successfully: {MatchId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            await successResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateMatch");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateMatch");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating match");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "An error occurred while creating the match",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Update an existing match
    /// </summary>
    [Function("UpdateMatch")]
    [OpenApiOperation(
        operationId: "UpdateMatch",
        tags: new[] { "Matches" },
        Summary = "Update a match",
        Description = "Updates an existing match. Lineup, coaches, substitutions, and report data are replaced entirely.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateMatchRequest),
        Required = true,
        Description = "Updated match details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match not found")]
    public async Task<HttpResponseData> UpdateMatch(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/matches/{id}")] HttpRequestData req,
        string id)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateMatch");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var matchGuid))
        {
            _logger.LogWarning("Invalid match ID format: {Id}", id);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Invalid match ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateMatchRequest>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateMatchRequest");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdateMatchCommand(matchGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Match updated successfully: {MatchId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateMatch");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateMatch");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating match");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "An error occurred while updating the match",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
