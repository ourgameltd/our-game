using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Drills;

/// <summary>
/// Azure Function for getting a drill by ID
/// </summary>
public class GetDrillByIdFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetDrillByIdFunction> _logger;

    public GetDrillByIdFunction(IMediator mediator, ILogger<GetDrillByIdFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get a drill by ID with full detail
    /// </summary>
    [Function("GetDrillById")]
    [OpenApiOperation(
        operationId: "GetDrillById",
        tags: new[] { "Drills" },
        Summary = "Get drill by ID",
        Description = "Retrieves full drill detail including attributes, equipment, instructions, variations, links, and scope assignments")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The drill ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "Drill retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "Drill not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "Invalid drill ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillDetailDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetDrillById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/drills/{id}")] HttpRequestData req,
        string id)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var drillGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.ErrorResponse(
                "Invalid drill ID format", 400));
            return badRequestResponse;
        }

        var drill = await _mediator.Send(new GetDrillByIdQuery(drillGuid));

        if (drill == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.NotFoundResponse(
                "Drill not found"));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<DrillDetailDto>.SuccessResponse(drill));
        return response;
    }
}
