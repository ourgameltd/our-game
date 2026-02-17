using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Tactics;

/// <summary>
/// Azure Function for getting a tactic by ID
/// </summary>
public class GetTacticByIdFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetTacticByIdFunction> _logger;

    public GetTacticByIdFunction(IMediator mediator, ILogger<GetTacticByIdFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get a tactic by ID with full detail
    /// </summary>
    [Function("GetTacticById")]
    [OpenApiOperation(
        operationId: "GetTacticById",
        tags: new[] { "Tactics" },
        Summary = "Get tactic by ID",
        Description = "Retrieves full tactic detail including resolved positions (computed with inheritance applied), base formation details, position overrides, principles, and scope assignments")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The tactic ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "Tactic retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "Tactic not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "Invalid tactic ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<TacticDetailDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetTacticById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/tactics/{id}")] HttpRequestData req,
        string id)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var tacticGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.ErrorResponse(
                "Invalid tactic ID format", 400));
            return badRequestResponse;
        }

        var tactic = await _mediator.Send(new GetTacticByIdQuery(tacticGuid));

        if (tactic == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.NotFoundResponse(
                "Tactic not found"));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<TacticDetailDto>.SuccessResponse(tactic));
        return response;
    }
}
