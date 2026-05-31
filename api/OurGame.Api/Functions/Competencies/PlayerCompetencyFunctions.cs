using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Competencies.Commands.UpdatePlayerCompetencies;
using OurGame.Application.UseCases.Competencies.Commands.UpdatePlayerCompetencies.DTOs;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencies;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencies.DTOs;
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
