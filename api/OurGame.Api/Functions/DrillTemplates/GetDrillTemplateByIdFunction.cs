using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById.DTOs;
using System.Net;

namespace OurGame.Api.Functions.DrillTemplates;

/// <summary>
/// Azure Function for getting a drill template by ID
/// </summary>
public class GetDrillTemplateByIdFunction
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetDrillTemplateByIdFunction> _logger;

    public GetDrillTemplateByIdFunction(IMediator mediator, ILogger<GetDrillTemplateByIdFunction> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get a drill template by ID with full detail
    /// </summary>
    [Function("GetDrillTemplateById")]
    [OpenApiOperation(
        operationId: "GetDrillTemplateById",
        tags: new[] { "DrillTemplates" },
        Summary = "Get drill template by ID",
        Description = "Retrieves full drill template detail including drill IDs, attributes, category, and scope assignments")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The drill template ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateDetailDto>),
        Description = "Drill template retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateDetailDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateDetailDto>),
        Description = "Drill template not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateDetailDto>),
        Description = "Invalid drill template ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<DrillTemplateDetailDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetDrillTemplateById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/drill-templates/{id}")] HttpRequestData req,
        string id)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var templateGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.ErrorResponse(
                "Invalid drill template ID format", 400));
            return badRequestResponse;
        }

        var template = await _mediator.Send(new GetDrillTemplateByIdQuery(templateGuid));

        if (template == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.NotFoundResponse(
                "Drill template not found"));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<DrillTemplateDetailDto>.SuccessResponse(template));
        return response;
    }
}
