using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Tactics.Commands.CreateTactic;
using OurGame.Application.UseCases.Tactics.Commands.CreateTactic.DTOs;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Tactics;

/// <summary>
/// Azure Function for creating a new tactic
/// </summary>
public class CreateTacticFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<CreateTacticFunction> _logger;

    public CreateTacticFunction(IMediator mediator, ILogger<CreateTacticFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a new tactic
    /// </summary>
    [Function("CreateTactic")]
    [OpenApiOperation(
        operationId: "CreateTactic",
        tags: new[] { "Tactics" },
        Summary = "Create a new tactic",
        Description = "Creates a new tactic based on a parent formation, with scope assignment, position overrides, and tactical principles.")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreateTacticRequestDto),
        Required = true,
        Description = "Tactic creation details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "Tactic created successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "Referenced resource not found (parent formation, etc.)")]
    public async Task<HttpResponseData> CreateTactic(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/tactics")] HttpRequestData req)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreateTactic");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<CreateTacticRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize CreateTacticRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreateTacticCommand(dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Tactic created successfully: {TacticId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            successResponse.Headers.Add("Location", $"/v1/tactics/{result.Id}");
            await successResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateTactic");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateTactic");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tactic");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.ErrorResponse(
                "An error occurred while creating the tactic",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
