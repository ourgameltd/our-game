using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Competencies.Commands.SetCompetencyAssignment;
using OurGame.Persistence.Enums;
using System.Net;

namespace OurGame.Api.Functions.Competencies;

public class CompetencyAssignmentFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<CompetencyAssignmentFunctions> _logger;

    public CompetencyAssignmentFunctions(IMediator mediator, ILogger<CompetencyAssignmentFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Function("SetClubCompetencyAssignment")]
    [OpenApiOperation(operationId: "SetClubCompetencyAssignment", tags: new[] { "Competencies" }, Summary = "Assign a framework to a club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(SetCompetencyAssignmentRequestDto), Required = true)]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Assigned and recalculation triggered")]
    public Task<HttpResponseData> SetClubAssignment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/clubs/{clubId}/competency-assignment")] HttpRequestData req,
        string clubId)
        => HandleAssign(req, CompetencyFrameworkScope.Club, clubId);

    [Function("SetAgeGroupCompetencyAssignment")]
    [OpenApiOperation(operationId: "SetAgeGroupCompetencyAssignment", tags: new[] { "Competencies" }, Summary = "Assign a framework to an age group")]
    [OpenApiParameter(name: "ageGroupId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(SetCompetencyAssignmentRequestDto), Required = true)]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Assigned and recalculation triggered")]
    public Task<HttpResponseData> SetAgeGroupAssignment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/age-groups/{ageGroupId}/competency-assignment")] HttpRequestData req,
        string ageGroupId)
        => HandleAssign(req, CompetencyFrameworkScope.AgeGroup, ageGroupId);

    [Function("SetTeamCompetencyAssignment")]
    [OpenApiOperation(operationId: "SetTeamCompetencyAssignment", tags: new[] { "Competencies" }, Summary = "Assign a framework to a team")]
    [OpenApiParameter(name: "teamId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid))]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(SetCompetencyAssignmentRequestDto), Required = true)]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Assigned and recalculation triggered")]
    public Task<HttpResponseData> SetTeamAssignment(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/teams/{teamId}/competency-assignment")] HttpRequestData req,
        string teamId)
        => HandleAssign(req, CompetencyFrameworkScope.Team, teamId);

    private async Task<HttpResponseData> HandleAssign(HttpRequestData req, CompetencyFrameworkScope scope, string scopeIdStr)
    {
        if (string.IsNullOrEmpty(req.GetUserId()))
        {
            var u = req.CreateResponse(HttpStatusCode.Unauthorized);
            await u.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Authentication required", 401));
            return u;
        }

        if (!Guid.TryParse(scopeIdStr, out var sid))
        {
            var b = req.CreateResponse(HttpStatusCode.BadRequest);
            await b.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid id", 400));
            return b;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<SetCompetencyAssignmentRequestDto>();
            if (dto is null)
            {
                var b = req.CreateResponse(HttpStatusCode.BadRequest);
                await b.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid request body", 400));
                return b;
            }

            await _mediator.Send(new SetCompetencyAssignmentCommand(scope, sid, dto));
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            var nf = req.CreateResponse(HttpStatusCode.NotFound);
            await nf.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return nf;
        }
        catch (ValidationException ex)
        {
            var v = req.CreateResponse(HttpStatusCode.BadRequest);
            await v.WriteAsJsonAsync(ApiResponse<object>.ValidationErrorResponse("Validation failed", ex.Errors));
            return v;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning framework at {Scope} {Id}", scope, sid);
            var s = req.CreateResponse(HttpStatusCode.InternalServerError);
            await s.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Server error", 500));
            return s;
        }
    }
}
