using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Reports.Queries.GetReportById;
using OurGame.Application.UseCases.Reports.Queries.GetReportById.DTOs;
using OurGame.Application.UseCases.Reports.Commands.CreateReport;
using OurGame.Application.UseCases.Reports.Commands.CreateReport.DTOs;
using OurGame.Application.UseCases.Reports.Commands.UpdateReport;
using OurGame.Application.UseCases.Reports.Commands.UpdateReport.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Report Card endpoints
/// </summary>
public class ReportFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<ReportFunctions> _logger;

    public ReportFunctions(IMediator mediator, ILogger<ReportFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get report card details by ID
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="reportId">The report ID</param>
    /// <returns>Report card detail information with development actions and similar professionals</returns>
    [Function("GetReportById")]
    [OpenApiOperation(operationId: "GetReportById", tags: new[] { "Reports" }, Summary = "Get report card by ID", Description = "Retrieves report card details including period, ratings, strengths, areas for improvement, coach comments, development actions, and similar professional player comparisons.")]
    [OpenApiParameter(name: "reportId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The report ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "Report retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "Report not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "Invalid report ID format")]
    public async Task<HttpResponseData> GetReportById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/reports/{reportId}")] HttpRequestData req,
        string reportId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(reportId, out var reportGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ReportDto>.ErrorResponse(
                "Invalid report ID format", 400));
            return badRequestResponse;
        }

        var report = await _mediator.Send(new GetReportByIdQuery(reportGuid));

        if (report == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<ReportDto>.ErrorResponse(
                "Report not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<ReportDto>.SuccessResponse(report));
        return response;
    }

    /// <summary>
    /// Create a new report card
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>Created report card details</returns>
    [Function("CreateReport")]
    [OpenApiOperation(operationId: "CreateReport", tags: new[] { "Reports" }, Summary = "Create new report card", Description = "Creates a new report card for a player with period, strengths, areas for improvement, coach comments, development actions, and professional player comparisons.")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreateReportRequestDto), Required = true, Description = "Report card data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "Report created successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "Invalid request data")]
    public async Task<HttpResponseData> CreateReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/reports")] HttpRequestData req)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        var dto = await req.ReadFromJsonAsync<CreateReportRequestDto>();

        if (dto == null)
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ReportDto>.ErrorResponse(
                "Invalid request body", 400));
            return badRequestResponse;
        }

        var report = await _mediator.Send(new CreateReportCommand(dto, azureUserId));

        var response = req.CreateResponse(HttpStatusCode.Created);
        await response.WriteAsJsonAsync(ApiResponse<ReportDto>.SuccessResponse(report));
        return response;
    }

    /// <summary>
    /// Update an existing report card
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="reportId">The report ID</param>
    /// <returns>Updated report card details</returns>
    [Function("UpdateReport")]
    [OpenApiOperation(operationId: "UpdateReport", tags: new[] { "Reports" }, Summary = "Update report card", Description = "Updates an existing report card with new period, strengths, areas for improvement, coach comments, development actions, and professional player comparisons.")]
    [OpenApiParameter(name: "reportId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The report ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateReportRequestDto), Required = true, Description = "Updated report card data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "Report updated successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "Report not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ReportDto>), Description = "Invalid request data")]
    public async Task<HttpResponseData> UpdateReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/reports/{reportId}")] HttpRequestData req,
        string reportId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(reportId, out var reportGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ReportDto>.ErrorResponse(
                "Invalid report ID format", 400));
            return badRequestResponse;
        }

        var dto = await req.ReadFromJsonAsync<UpdateReportRequestDto>();

        if (dto == null)
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ReportDto>.ErrorResponse(
                "Invalid request body", 400));
            return badRequestResponse;
        }

        var report = await _mediator.Send(new UpdateReportCommand(reportGuid, dto, azureUserId));

        if (report == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<ReportDto>.ErrorResponse(
                "Report not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<ReportDto>.SuccessResponse(report));
        return response;
    }
}
