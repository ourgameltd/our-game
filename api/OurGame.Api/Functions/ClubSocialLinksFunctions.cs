using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Clubs.Queries.GetClubSocialLinks;
using OurGame.Application.UseCases.Clubs.Queries.GetClubSocialLinks.DTOs;
using OurGame.Application.UseCases.Clubs.Commands.UpsertClubSocialLinks;
using OurGame.Application.UseCases.Clubs.Commands.UpsertClubSocialLinks.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Club Social Links endpoints
/// </summary>
public class ClubSocialLinksFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<ClubSocialLinksFunctions> _logger;

    public ClubSocialLinksFunctions(IMediator mediator, ILogger<ClubSocialLinksFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get social media links for a club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>Club social links, or null if not yet configured</returns>
    [Function("GetClubSocialLinks")]
    [OpenApiOperation(operationId: "GetClubSocialLinks", tags: new[] { "Clubs" }, Summary = "Get club social links", Description = "Retrieves social media links for a specific club. Returns null data if the club has not configured social links yet.")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<ClubSocialLinksDto>), Description = "Social links retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ClubSocialLinksDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubSocialLinksDto>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<ClubSocialLinksDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubSocialLinks(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/social-links")] HttpRequestData req,
        string clubId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubSocialLinksDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var result = await _mediator.Send(new GetClubSocialLinksQuery(clubGuid));

        // Null is valid — the club simply hasn't configured social links yet
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<ClubSocialLinksDto>.SuccessResponse(result!));
        return response;
    }

    /// <summary>
    /// Create or update social media links for a club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>The updated club social links</returns>
    [Function("UpsertClubSocialLinks")]
    [OpenApiOperation(operationId: "UpsertClubSocialLinks", tags: new[] { "Clubs" }, Summary = "Upsert club social links", Description = "Creates or updates social media links for a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpsertClubSocialLinksRequestDto), Required = true, Description = "Social links details")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<ClubSocialLinksDto>), Description = "Social links upserted successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ClubSocialLinksDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubSocialLinksDto>), Description = "Invalid request data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<ClubSocialLinksDto>), Description = "Club not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.UnprocessableEntity, contentType: "application/json", bodyType: typeof(ApiResponse<ClubSocialLinksDto>), Description = "Validation error")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<ClubSocialLinksDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> UpsertClubSocialLinks(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/clubs/{clubId}/social-links")] HttpRequestData req,
        string clubId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubSocialLinksDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpsertClubSocialLinksRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpsertClubSocialLinksRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubSocialLinksDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpsertClubSocialLinksCommand(clubGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Club social links upserted successfully for club {ClubId}", clubGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<ClubSocialLinksDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpsertClubSocialLinks");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<ClubSocialLinksDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpsertClubSocialLinks");
            var validationResponse = req.CreateResponse(HttpStatusCode.UnprocessableEntity);
            await validationResponse.WriteAsJsonAsync(ApiResponse<ClubSocialLinksDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upserting club social links");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<ClubSocialLinksDto>.ErrorResponse(
                "An error occurred while upserting club social links",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
