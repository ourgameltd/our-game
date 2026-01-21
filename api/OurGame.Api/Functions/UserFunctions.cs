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
}
