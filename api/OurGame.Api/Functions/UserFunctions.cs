using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetMyChildren;
using OurGame.Application.UseCases.Players.Queries.GetMyChildren.DTOs;
using OurGame.Application.UseCases.Users.Queries.GetMyClubs;
using OurGame.Application.UseCases.Users.Queries.GetMyClubs.DTOs;
using OurGame.Application.UseCases.Users.Commands.UpdateMyProfile;
using OurGame.Application.UseCases.Users.Commands.UpdateMyProfile.DTOs;
using OurGame.Application.Abstractions.Exceptions;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for User endpoints
/// </summary>
public class UserFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<UserFunctions> _logger;

    public UserFunctions(IMediator mediator, ILogger<UserFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get current authenticated user profile
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>Profile information about the authenticated user</returns>
    [Function("GetMe")]
    [OpenApiOperation(operationId: "GetMe", tags: new[] { "Users" }, Summary = "Get current user", Description = "Retrieves profile information about the currently authenticated user")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<UserProfileDto>), Description = "User retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<UserProfileDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<UserProfileDto>), Description = "User profile not found in database")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<UserProfileDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetMe(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/users/me")] HttpRequestData req)
    {
        // Get user ID from Azure Static Web Apps authentication
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            _logger.LogWarning("Unauthorized request to /me endpoint");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<UserProfileDto>.ErrorResponse(
                "User not authenticated", 401));
            return unauthorizedResponse;
        }

        var user = await _mediator.Send(new GetUserByAzureIdQuery(azureUserId));

        if (user == null)
        {
            _logger.LogWarning("User not found for Id {AzureUserId}", azureUserId);
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<UserProfileDto>.ErrorResponse(
                "User profile not found in database", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<UserProfileDto>.SuccessResponse(user));
        return response;
    }

    /// <summary>
    /// Get children players for the current authenticated parent user
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>List of child players assigned to the authenticated parent</returns>
    [Function("GetMyChildren")]
    [OpenApiOperation(operationId: "GetMyChildren", tags: new[] { "Users" }, Summary = "Get my children", Description = "Retrieves all child players for the currently authenticated parent user")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ChildPlayerDto>>), Description = "Children retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<ChildPlayerDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<ChildPlayerDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetMyChildren(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/users/me/children")] HttpRequestData req)
    {
        // Get user ID from Azure Static Web Apps authentication
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        var children = await _mediator.Send(new GetMyChildrenQuery(azureUserId));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<ChildPlayerDto>>.SuccessResponse(children));
        return response;
    }

    /// <summary>
    /// Get clubs for the current authenticated user
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <returns>List of clubs the authenticated user has access to</returns>
    [Function("GetMyClubs")]
    [OpenApiOperation(operationId: "GetMyClubs", tags: new[] { "Users", "Clubs" }, Summary = "Get clubs for current user", Description = "Returns all clubs the authenticated user has access to with team and player counts")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<MyClubListItemDto>>), Description = "Successfully retrieved user's clubs")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    public async Task<HttpResponseData> GetMyClubs(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/users/me/clubs")] HttpRequestData req)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        var result = await _mediator.Send(new GetMyClubsQuery(azureUserId));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<MyClubListItemDto>>.SuccessResponse(result));
        return response;
    }

    /// <summary>
    /// Update current authenticated user profile
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Updated profile information</returns>
    [Function("UpdateMe")]
    [OpenApiOperation(operationId: "UpdateMe", tags: new[] { "Users" }, Summary = "Update current user profile", Description = "Updates profile information for the currently authenticated user")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateMyProfileRequestDto), Required = true, Description = "Profile update details")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<UserProfileDto>), Description = "Profile updated successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Validation errors")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Unauthorized")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> UpdateMe(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/users/me")] HttpRequestData req,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();

        if (string.IsNullOrEmpty(authId))
        {
            _logger.LogWarning("Unauthorized request to UpdateMe endpoint");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Unauthorized", (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        var dto = await req.ReadFromJsonAsync<UpdateMyProfileRequestDto>(ct);
        if (dto == null)
        {
            _logger.LogWarning("Failed to deserialize UpdateMyProfileRequestDto");
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid request body",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var result = await _mediator.Send(new UpdateMyProfileCommand(authId, dto), ct);

            _logger.LogInformation("User profile updated successfully: {UserId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<UserProfileDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateMe");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<object>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "User not found during UpdateMe");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user profile");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while updating the user profile",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }
}
