using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Competencies.Commands.ArchivePlayerCompetencyEvaluation;
using OurGame.Application.UseCases.Competencies.Commands.ArchivePlayerCompetencyEvaluation.DTOs;
using OurGame.Application.UseCases.Competencies.Commands.UpdatePlayerCompetencies;
using OurGame.Application.UseCases.Competencies.Commands.UpdatePlayerCompetencies.DTOs;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencies;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencies.DTOs;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencyEvaluations;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencyEvaluations.DTOs;
using System.Net;

namespace OurGame.Api.Functions.Competencies;

public class PlayerCompetencyFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<PlayerCompetencyFunctions> _logger;

    public PlayerCompetencyFunctions(IMediator mediator, ILogger<PlayerCompetencyFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Function("GetPlayerCompetencies")]
    [OpenApiOperation(operationId: "GetPlayerCompetencies", tags: new[] { "Competencies" }, Summary = "Get player competencies and per-team scores")]
    [OpenApiParameter(name: "playerId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerCompetenciesDto>), Description = "Player competency profile")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<PlayerCompetenciesDto>), Description = "Player not found")]
    public async Task<HttpResponseData> GetPlayerCompetencies(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}/competencies")] HttpRequestData req,
        string playerId)
    {
        if (string.IsNullOrEmpty(req.GetUserId()))
            return await WriteUnauthorized<PlayerCompetenciesDto>(req);

        if (!Guid.TryParse(playerId, out var pid))
            return await WriteBadRequest<PlayerCompetenciesDto>(req, "Invalid player ID");

        var result = await _mediator.Send(new GetPlayerCompetenciesQuery(pid));
        if (result is null)
            return await WriteNotFound<PlayerCompetenciesDto>(req, "Player not found");

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<PlayerCompetenciesDto>.SuccessResponse(result));
        return response;
    }

    [Function("UpdatePlayerCompetencies")]
    [OpenApiOperation(operationId: "UpdatePlayerCompetencies", tags: new[] { "Competencies" }, Summary = "Save a player's competency bands and recalculate scores")]
    [OpenApiParameter(name: "playerId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdatePlayerCompetenciesRequestDto), Required = true)]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Saved and recalculated")]
    public async Task<HttpResponseData> UpdatePlayerCompetencies(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/players/{playerId}/competencies")] HttpRequestData req,
        string playerId)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId)) return await WriteUnauthorized<object>(req);
        if (!Guid.TryParse(playerId, out var pid)) return await WriteBadRequest<object>(req, "Invalid player ID");

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdatePlayerCompetenciesRequestDto>();
            if (dto is null) return await WriteBadRequest<object>(req, "Invalid request body");

            await _mediator.Send(new UpdatePlayerCompetenciesCommand(pid, userId, dto));
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            return await WriteNotFound<object>(req, ex.Message);
        }
        catch (ValidationException ex)
        {
            var resp = req.CreateResponse(HttpStatusCode.BadRequest);
            await resp.WriteAsJsonAsync(ApiResponse<object>.ValidationErrorResponse("Validation failed", ex.Errors));
            return resp;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating player competencies for {PlayerId}", pid);
            var resp = req.CreateResponse(HttpStatusCode.InternalServerError);
            await resp.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Server error", 500));
            return resp;
        }
    }

    [Function("GetPlayerCompetencyEvaluations")]
    [OpenApiOperation(operationId: "GetPlayerCompetencyEvaluations", tags: new[] { "Competencies" }, Summary = "Get audit history of competency evaluations for a player")]
    [OpenApiParameter(name: "playerId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<PlayerCompetencyEvaluationSummaryDto>>), Description = "Evaluation history ordered newest first")]
    public async Task<HttpResponseData> GetPlayerCompetencyEvaluations(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/players/{playerId}/competency-evaluations")] HttpRequestData req,
        string playerId)
    {
        if (string.IsNullOrEmpty(req.GetUserId()))
            return await WriteUnauthorized<List<PlayerCompetencyEvaluationSummaryDto>>(req);

        if (!Guid.TryParse(playerId, out var pid))
            return await WriteBadRequest<List<PlayerCompetencyEvaluationSummaryDto>>(req, "Invalid player ID");

        var result = await _mediator.Send(new GetPlayerCompetencyEvaluationsQuery(pid));
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<PlayerCompetencyEvaluationSummaryDto>>.SuccessResponse(result));
        return response;
    }

    [Function("ArchivePlayerCompetencyEvaluation")]
    [OpenApiOperation(operationId: "ArchivePlayerCompetencyEvaluation", tags: new[] { "Competencies" }, Summary = "Archive or unarchive a competency evaluation")]
    [OpenApiParameter(name: "playerId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiParameter(name: "evaluationId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(ArchivePlayerCompetencyEvaluationRequestDto), Required = true)]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Archive state updated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Evaluation not found")]
    public async Task<HttpResponseData> ArchivePlayerCompetencyEvaluation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "v1/players/{playerId}/competency-evaluations/{evaluationId}")] HttpRequestData req,
        string playerId,
        string evaluationId)
    {
        if (string.IsNullOrEmpty(req.GetUserId()))
            return await WriteUnauthorized<object>(req);

        if (!Guid.TryParse(playerId, out var pid))
            return await WriteBadRequest<object>(req, "Invalid player ID");

        if (!Guid.TryParse(evaluationId, out var eid))
            return await WriteBadRequest<object>(req, "Invalid evaluation ID");

        try
        {
            var dto = await req.ReadFromJsonAsync<ArchivePlayerCompetencyEvaluationRequestDto>();
            if (dto is null) return await WriteBadRequest<object>(req, "Invalid request body");

            await _mediator.Send(new ArchivePlayerCompetencyEvaluationCommand(pid, eid, dto.IsArchived));
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            return await WriteNotFound<object>(req, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving evaluation {EvaluationId}", eid);
            var resp = req.CreateResponse(HttpStatusCode.InternalServerError);
            await resp.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Server error", 500));
            return resp;
        }
    }

    private static async Task<HttpResponseData> WriteUnauthorized<T>(HttpRequestData req)
    {
        var r = req.CreateResponse(HttpStatusCode.Unauthorized);
        await r.WriteAsJsonAsync(ApiResponse<T>.ErrorResponse("Authentication required", 401));
        return r;
    }

    private static async Task<HttpResponseData> WriteBadRequest<T>(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.BadRequest);
        await r.WriteAsJsonAsync(ApiResponse<T>.ErrorResponse(message, 400));
        return r;
    }

    private static async Task<HttpResponseData> WriteNotFound<T>(HttpRequestData req, string message)
    {
        var r = req.CreateResponse(HttpStatusCode.NotFound);
        await r.WriteAsJsonAsync(ApiResponse<T>.NotFoundResponse(message));
        return r;
    }
}
