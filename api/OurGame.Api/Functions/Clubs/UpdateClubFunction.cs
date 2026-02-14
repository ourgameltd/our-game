using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubById;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubById.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Clubs;

/// <summary>
/// Azure Function for updating an existing club
/// </summary>
public class UpdateClubFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<UpdateClubFunction> _logger;

    public UpdateClubFunction(IMediator mediator, ILogger<UpdateClubFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Update an existing club's details
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>The updated club</returns>
    [Function("UpdateClub")]
    [OpenApiOperation(
        operationId: "UpdateClub",
        tags: new[] { "Clubs" },
        Summary = "Update club details",
        Description = "Updates an existing club's name, colors, location, history, ethos, and principles.")]
    [OpenApiParameter(
        name: "clubId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The club identifier (UUID)")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateClubRequestDto),
        Required = true,
        Description = "Updated club details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<ClubDetailDto>),
        Description = "Club updated successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.BadRequest,
        Description = "Invalid request data or validation failure")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NotFound,
        Description = "Club not found")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    public async Task<HttpResponseData> UpdateClub(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/clubs/{clubId}")] HttpRequestData req,
        string clubId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateClub");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            _logger.LogWarning("Invalid clubId format: {ClubId}", clubId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.ErrorResponse(
                "Invalid club ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        var dto = await req.ReadFromJsonAsync<UpdateClubRequestDto>();
        if (dto == null)
        {
            _logger.LogWarning("Failed to deserialize UpdateClubRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var command = new UpdateClubCommand(clubGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Club updated successfully: {ClubId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateClub");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateClub");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<ClubDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
    }
}
