using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Competencies.Commands.CreateCompetencyFramework;
using OurGame.Application.UseCases.Competencies.Commands.DeleteCompetencyFramework;
using OurGame.Application.UseCases.Competencies.Commands.UpdateCompetencyFramework;
using OurGame.Application.UseCases.Competencies.Queries.GetCompetencyFramework;
using OurGame.Application.UseCases.Competencies.Queries.GetCompetencyFramework.DTOs;
using OurGame.Application.UseCases.Competencies.Queries.GetCompetencyFrameworks;
using OurGame.Application.UseCases.Competencies.Queries.GetCompetencyFrameworks.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Competencies;

public class CompetencyFrameworkFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<CompetencyFrameworkFunctions> _logger;

    public CompetencyFrameworkFunctions(IMediator mediator, ILogger<CompetencyFrameworkFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Function("GetClubCompetencyFrameworks")]
    [OpenApiOperation(operationId: "GetClubCompetencyFrameworks", tags: new[] { "Competencies" }, Summary = "List frameworks visible to a club (system + owned)")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<CompetencyFrameworkListItemDto>>), Description = "Frameworks listed")]
    public async Task<HttpResponseData> GetClubCompetencyFrameworks(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/competency-frameworks")] HttpRequestData req,
        string clubId)
    {
        if (string.IsNullOrEmpty(req.GetUserId())) return await Unauthorized<List<CompetencyFrameworkListItemDto>>(req);
        if (!Guid.TryParse(clubId, out var cid)) return await Bad<List<CompetencyFrameworkListItemDto>>(req, "Invalid club id");

        var result = await _mediator.Send(new GetClubCompetencyFrameworksQuery(cid));
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<CompetencyFrameworkListItemDto>>.SuccessResponse(result));
        return response;
    }

    [Function("GetCompetencyFramework")]
    [OpenApiOperation(operationId: "GetCompetencyFramework", tags: new[] { "Competencies" }, Summary = "Get full framework detail")]
    [OpenApiParameter(name: "frameworkId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<CompetencyFrameworkDetailDto>), Description = "Framework detail")]
    public async Task<HttpResponseData> GetCompetencyFramework(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/competency-frameworks/{frameworkId}")] HttpRequestData req,
        string frameworkId)
    {
        if (string.IsNullOrEmpty(req.GetUserId())) return await Unauthorized<CompetencyFrameworkDetailDto>(req);
        if (!Guid.TryParse(frameworkId, out var fid)) return await Bad<CompetencyFrameworkDetailDto>(req, "Invalid framework id");

        var result = await _mediator.Send(new GetCompetencyFrameworkQuery(fid));
        if (result is null) return await NotFound<CompetencyFrameworkDetailDto>(req, "Framework not found");

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<CompetencyFrameworkDetailDto>.SuccessResponse(result));
        return response;
    }

    [Function("CreateCompetencyFramework")]
    [OpenApiOperation(operationId: "CreateCompetencyFramework", tags: new[] { "Competencies" }, Summary = "Create or clone a framework")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreateCompetencyFrameworkRequestDto), Required = true)]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<Guid>), Description = "Framework created")]
    public async Task<HttpResponseData> CreateCompetencyFramework(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/competency-frameworks")] HttpRequestData req)
    {
        if (string.IsNullOrEmpty(req.GetUserId())) return await Unauthorized<Guid>(req);

        try
        {
            var dto = await req.ReadFromJsonAsync<CreateCompetencyFrameworkRequestDto>();
            if (dto is null) return await Bad<Guid>(req, "Invalid request body");

            var id = await _mediator.Send(new CreateCompetencyFrameworkCommand(dto));
            var response = req.CreateResponse(HttpStatusCode.Created);
            response.Headers.Add("Location", $"/v1/competency-frameworks/{id}");
            await response.WriteAsJsonAsync(ApiResponse<Guid>.SuccessResponse(id, (int)HttpStatusCode.Created));
            return response;
        }
        catch (NotFoundException ex) { return await NotFound<Guid>(req, ex.Message); }
        catch (ValidationException ex) { return await Validation<Guid>(req, ex); }
        catch (Exception ex) { _logger.LogError(ex, "Error creating framework"); return await ServerError<Guid>(req); }
    }

    [Function("UpdateCompetencyFramework")]
    [OpenApiOperation(operationId: "UpdateCompetencyFramework", tags: new[] { "Competencies" }, Summary = "Update a framework's weights, descriptions and thresholds")]
    [OpenApiParameter(name: "frameworkId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateCompetencyFrameworkRequestDto), Required = true)]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Updated")]
    public async Task<HttpResponseData> UpdateCompetencyFramework(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/competency-frameworks/{frameworkId}")] HttpRequestData req,
        string frameworkId)
    {
        if (string.IsNullOrEmpty(req.GetUserId())) return await Unauthorized<object>(req);
        if (!Guid.TryParse(frameworkId, out var fid)) return await Bad<object>(req, "Invalid framework id");

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateCompetencyFrameworkRequestDto>();
            if (dto is null) return await Bad<object>(req, "Invalid request body");

            await _mediator.Send(new UpdateCompetencyFrameworkCommand(fid, dto));
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex) { return await NotFound<object>(req, ex.Message); }
        catch (ValidationException ex) { return await Validation<object>(req, ex); }
        catch (Exception ex) { _logger.LogError(ex, "Error updating framework {Id}", fid); return await ServerError<object>(req); }
    }

    [Function("DeleteCompetencyFramework")]
    [OpenApiOperation(operationId: "DeleteCompetencyFramework", tags: new[] { "Competencies" }, Summary = "Archive a framework")]
    [OpenApiParameter(name: "frameworkId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Archived")]
    public async Task<HttpResponseData> DeleteCompetencyFramework(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "v1/competency-frameworks/{frameworkId}")] HttpRequestData req,
        string frameworkId)
    {
        if (string.IsNullOrEmpty(req.GetUserId())) return await Unauthorized<object>(req);
        if (!Guid.TryParse(frameworkId, out var fid)) return await Bad<object>(req, "Invalid framework id");

        try
        {
            await _mediator.Send(new DeleteCompetencyFrameworkCommand(fid));
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex) { return await NotFound<object>(req, ex.Message); }
        catch (ValidationException ex) { return await Validation<object>(req, ex); }
        catch (Exception ex) { _logger.LogError(ex, "Error deleting framework {Id}", fid); return await ServerError<object>(req); }
    }

    private static async Task<HttpResponseData> Unauthorized<T>(HttpRequestData req)
    {
        var r = req.CreateResponse(HttpStatusCode.Unauthorized);
        await r.WriteAsJsonAsync(ApiResponse<T>.ErrorResponse("Authentication required", 401));
        return r;
    }
    private static async Task<HttpResponseData> Bad<T>(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.BadRequest);
        await r.WriteAsJsonAsync(ApiResponse<T>.ErrorResponse(message, 400));
        return r;
    }
    private static async Task<HttpResponseData> NotFound<T>(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.NotFound);
        await r.WriteAsJsonAsync(ApiResponse<T>.NotFoundResponse(message));
        return r;
    }
    private static async Task<HttpResponseData> Validation<T>(HttpRequestData req, ValidationException ex)
    {
        var r = req.CreateResponse(HttpStatusCode.BadRequest);
        await r.WriteAsJsonAsync(ApiResponse<T>.ValidationErrorResponse("Validation failed", ex.Errors));
        return r;
    }
    private static async Task<HttpResponseData> ServerError<T>(HttpRequestData req)
    {
        var r = req.CreateResponse(HttpStatusCode.InternalServerError);
        await r.WriteAsJsonAsync(ApiResponse<T>.ErrorResponse("Server error", 500));
        return r;
    }
}
