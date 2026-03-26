using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.CreatePlayer;
using OurGame.Application.UseCases.Players.Commands.CreatePlayer.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Players;

/// <summary>
/// Azure Function for creating a player inside a club.
/// </summary>
public class CreateClubPlayerFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<CreateClubPlayerFunction> _logger;

    public CreateClubPlayerFunction(IMediator mediator, ILogger<CreateClubPlayerFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Function("CreateClubPlayer")]
    [OpenApiOperation(
        operationId: "CreateClubPlayer",
        tags: new[] { "Clubs", "Players" },
        Summary = "Create club player",
        Description = "Creates a new player for a club with optional team assignments and emergency contacts.")]
    [OpenApiParameter(
        name: "clubId",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The club ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreatePlayerRequestDto),
        Required = true,
        Description = "Player details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerDto>),
        Description = "Player created successfully")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerDto>),
        Description = "Club not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PlayerDto>),
        Description = "Unexpected server error")]
    public async Task<HttpResponseData> CreateClubPlayer(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/clubs/{clubId}/players")] HttpRequestData req,
        string clubId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreateClubPlayer");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            _logger.LogWarning("Invalid club ID format: {ClubId}", clubId);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                "Invalid club ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<CreatePlayerRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize CreatePlayerRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var result = await _mediator.Send(new CreatePlayerCommand(clubGuid, dto, userId));

            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            successResponse.Headers.Add("Location", $"/v1/players/{result.Id}");
            await successResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Not found during CreateClubPlayer for club {ClubId}", clubGuid);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateClubPlayer");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating player for club {ClubId}", clubGuid);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<PlayerDto>.ErrorResponse(
                "An error occurred while creating the player",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}