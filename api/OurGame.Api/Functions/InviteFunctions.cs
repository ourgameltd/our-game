using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Attributes;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Invites.Commands.AcceptInvite;
using OurGame.Application.UseCases.Invites.Commands.AcceptInvite.DTOs;
using OurGame.Application.UseCases.Invites.Commands.CreateInvite;
using OurGame.Application.UseCases.Invites.Commands.CreateInvite.DTOs;
using OurGame.Application.UseCases.Invites.Commands.RevokeInvite;
using OurGame.Application.UseCases.Invites.Commands.UpdateInviteLinks;
using OurGame.Application.UseCases.Invites.Commands.UpdateInviteLinks.DTOs;
using OurGame.Application.UseCases.Invites.Queries.GetClubInvites;
using OurGame.Application.UseCases.Invites.Queries.GetClubInvites.DTOs;
using OurGame.Application.UseCases.Invites.Queries.GetInviteByCode;
using OurGame.Application.UseCases.Invites.Queries.GetInviteByCode.DTOs;
using OurGame.Application.UseCases.Invites.Queries.GetInviteLinkOptions;
using OurGame.Application.UseCases.Invites.Queries.GetInviteLinkOptions.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Invite endpoints
/// </summary>
public class InviteFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<InviteFunctions> _logger;

    public InviteFunctions(IMediator mediator, ILogger<InviteFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get available linking candidates for an open invite
    /// </summary>
    [Function("GetInviteLinkOptions")]
    [OpenApiOperation(operationId: "GetInviteLinkOptions", tags: new[] { "Invites" }, Summary = "Get invite link options", Description = "Returns available entities to link for an open invite code.")]
    [OpenApiParameter(name: "code", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The 8-character invite code")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<InviteLinkOptionsDto>), Description = "Invite link options retrieved")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invite not found")]
    public async Task<HttpResponseData> GetInviteLinkOptions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/invites/{code}/links")] HttpRequestData req,
        string code,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("User not authenticated", 401), ct);
            return unauthorizedResponse;
        }

        try
        {
            var result = await _mediator.Send(new GetInviteLinkOptionsQuery(code, authId), ct);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<InviteLinkOptionsDto>.SuccessResponse(result), ct);
            return response;
        }
        catch (NotFoundException ex)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<object>.ValidationErrorResponse("Validation failed", ex.Errors), ct);
            return validationResponse;
        }
    }

    /// <summary>
    /// Update account links for an open invite
    /// </summary>
    [Function("UpdateInviteLinks")]
    [OpenApiOperation(operationId: "UpdateInviteLinks", tags: new[] { "Invites" }, Summary = "Update invite links", Description = "Creates/removes links between current user and invite-related entities.")]
    [OpenApiParameter(name: "code", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The 8-character invite code")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateInviteLinksRequestDto), Required = true, Description = "Selected entities to link")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<AcceptInviteResultDto>), Description = "Invite links updated successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    public async Task<HttpResponseData> UpdateInviteLinks(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/invites/{code}/links")] HttpRequestData req,
        string code,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("User not authenticated", 401), ct);
            return unauthorizedResponse;
        }

        var email = req.GetUserEmail() ?? req.GetUserDisplayName() ?? string.Empty;
        var body = await req.ReadFromJsonAsync<UpdateInviteLinksRequestDto>(ct) ?? new UpdateInviteLinksRequestDto();

        try
        {
            var firstName = req.GetUserDisplayName() ?? string.Empty;
            var result = await _mediator.Send(
                new UpdateInviteLinksCommand(code, authId, email, firstName, string.Empty, body),
                ct);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<AcceptInviteResultDto>.SuccessResponse(result), ct);
            return response;
        }
        catch (ValidationException ex)
        {
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<object>.ValidationErrorResponse("Validation failed", ex.Errors), ct);
            return validationResponse;
        }
        catch (NotFoundException ex)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFoundResponse;
        }
    }

    /// <summary>
    /// Create a new invite
    /// </summary>
    [Function("CreateInvite")]
    [OpenApiOperation(operationId: "CreateInvite", tags: new[] { "Invites" }, Summary = "Create invite", Description = "Creates a new invite for a coach, player, or parent to link their account")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreateInviteRequestDto), Required = true, Description = "Invite details")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<InviteDto>), Description = "Invite created successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Validation error")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> CreateInvite(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/invites")] HttpRequestData req,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("User not authenticated", 401), ct);
            return unauthorizedResponse;
        }

        var dto = await req.ReadFromJsonAsync<CreateInviteRequestDto>(ct);
        if (dto == null)
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid request body", 400), ct);
            return badRequestResponse;
        }

        try
        {
            var result = await _mediator.Send(new CreateInviteCommand(authId, dto), ct);
            var response = req.CreateResponse(HttpStatusCode.Created);
            await response.WriteAsJsonAsync(ApiResponse<InviteDto>.SuccessResponse(result, 201), ct);
            return response;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error creating invite");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<object>.ValidationErrorResponse("Validation failed", ex.Errors), ct);
            return validationResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Entity not found creating invite");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating invite");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("An error occurred while creating the invite", 500), ct);
            return errorResponse;
        }
    }

    /// <summary>
    /// Get invite details by code (anonymous)
    /// </summary>
    [Function("GetInviteByCode")]
    [AllowAnonymousEndpoint]
    [OpenApiOperation(operationId: "GetInviteByCode", tags: new[] { "Invites" }, Summary = "Get invite by code", Description = "Returns invite display info for the accept page. Does not require authentication.")]
    [OpenApiParameter(name: "code", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The 8-character invite code")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<InviteDetailsDto>), Description = "Invite details retrieved")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invite not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetInviteByCode(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/invites/{code}")] HttpRequestData req,
        string code,
        CancellationToken ct = default)
    {
        try
        {
            var result = await _mediator.Send(new GetInviteByCodeQuery(code), ct);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<InviteDetailsDto>.SuccessResponse(result), ct);
            return response;
        }
        catch (NotFoundException)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse($"Invite '{code}' not found"), ct);
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving invite {Code}", code);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("An error occurred while retrieving the invite", 500), ct);
            return errorResponse;
        }
    }

    /// <summary>
    /// Accept an invite and link account
    /// </summary>
    [Function("AcceptInvite")]
    [OpenApiOperation(operationId: "AcceptInvite", tags: new[] { "Invites" }, Summary = "Accept invite", Description = "Accepts the invite and links the authenticated user's account to the correct domain record")]
    [OpenApiParameter(name: "code", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The 8-character invite code")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(AcceptInviteRequestDto), Required = false, Description = "User display name details (used when creating a new user record)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<AcceptInviteResultDto>), Description = "Invite accepted successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Validation error (expired, revoked, email mismatch)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invite not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> AcceptInvite(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/invites/{code}/accept")] HttpRequestData req,
        string code,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("User not authenticated", 401), ct);
            return unauthorizedResponse;
        }

        var email = req.GetUserEmail() ?? req.GetUserDisplayName() ?? string.Empty;

        var body = await req.ReadFromJsonAsync<AcceptInviteRequestDto>(ct);

        try
        {
            var result = await _mediator.Send(
                new AcceptInviteCommand(code, authId, email, body?.FirstName ?? string.Empty, body?.LastName ?? string.Empty),
                ct);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<AcceptInviteResultDto>.SuccessResponse(result), ct);
            return response;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error accepting invite {Code}", code);
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<object>.ValidationErrorResponse("Validation failed", ex.Errors), ct);
            return validationResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Invite not found: {Code}", code);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accepting invite {Code}", code);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("An error occurred while accepting the invite", 500), ct);
            return errorResponse;
        }
    }

    /// <summary>
    /// Revoke a pending invite
    /// </summary>
    [Function("RevokeInvite")]
    [OpenApiOperation(operationId: "RevokeInvite", tags: new[] { "Invites" }, Summary = "Revoke invite", Description = "Revokes a pending invite")]
    [OpenApiParameter(name: "inviteId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The invite ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invite revoked successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Validation error")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invite not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> RevokeInvite(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "v1/invites/{inviteId}")] HttpRequestData req,
        string inviteId,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("User not authenticated", 401), ct);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(inviteId, out var inviteGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid invite ID format", 400), ct);
            return badRequestResponse;
        }

        try
        {
            await _mediator.Send(new RevokeInviteCommand(inviteGuid, authId), ct);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<object>.SuccessResponse(new object()), ct);
            return response;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error revoking invite {InviteId}", inviteId);
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<object>.ValidationErrorResponse("Validation failed", ex.Errors), ct);
            return validationResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Invite not found: {InviteId}", inviteId);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking invite {InviteId}", inviteId);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("An error occurred while revoking the invite", 500), ct);
            return errorResponse;
        }
    }

    /// <summary>
    /// List all invites for a club
    /// </summary>
    [Function("GetClubInvites")]
    [OpenApiOperation(operationId: "GetClubInvites", tags: new[] { "Invites", "Clubs" }, Summary = "Get club invites", Description = "Returns all invites for a given club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubInviteDto>>), Description = "Invites retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invalid club ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubInvites(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/invites")] HttpRequestData req,
        string clubId,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("User not authenticated", 401), ct);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid club ID format", 400), ct);
            return badRequestResponse;
        }

        try
        {
            var result = await _mediator.Send(new GetClubInvitesQuery(clubGuid, authId), ct);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<List<ClubInviteDto>>.SuccessResponse(result), ct);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving invites for club {ClubId}", clubId);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("An error occurred while retrieving club invites", 500), ct);
            return errorResponse;
        }
    }
}
