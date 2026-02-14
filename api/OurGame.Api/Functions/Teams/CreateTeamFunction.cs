using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.CreateTeam;
using OurGame.Application.UseCases.Teams.Commands.CreateTeam.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Teams;

/// <summary>
/// Azure Function for creating a new team
/// </summary>
public class CreateTeamFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<CreateTeamFunction> _logger;

    public CreateTeamFunction(IMediator mediator, ILogger<CreateTeamFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a new team
    /// </summary>
    [Function("CreateTeam")]
    [OpenApiOperation(
        operationId: "createTeam",
        tags: new[] { "Teams" },
        Summary = "Create a new team",
        Description = "Creates a new team within a club and age group.")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreateTeamRequest),
        Required = true,
        Description = "Team creation details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamOverviewTeamDto>),
        Description = "Team created successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamOverviewTeamDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamOverviewTeamDto>),
        Description = "Referenced resource not found (club, age group, etc.)")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TeamOverviewTeamDto>),
        Description = "An unexpected error occurred")]
    public async Task<HttpResponseData> CreateTeam(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/teams")] HttpRequestData req)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreateTeam");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        try
        {
            var request = await req.ReadFromJsonAsync<CreateTeamRequest>();
            if (request == null)
            {
                _logger.LogWarning("Failed to deserialize CreateTeamRequest");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreateTeamCommand(request);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Team created successfully: {TeamId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            successResponse.Headers.Add("Location", $"/v1/teams/{result.Id}");
            await successResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateTeam");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateTeam");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating team");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TeamOverviewTeamDto>.ErrorResponse(
                "An error occurred while creating the team",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
