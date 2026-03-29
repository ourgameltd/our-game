using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.PushSubscriptions.Commands.DeletePushSubscription;
using OurGame.Application.UseCases.PushSubscriptions.Commands.DeletePushSubscription.DTOs;
using OurGame.Application.UseCases.PushSubscriptions.Commands.SavePushSubscription;
using OurGame.Application.UseCases.PushSubscriptions.Commands.SavePushSubscription.DTOs;
using OurGame.Application.UseCases.PushSubscriptions.Queries.GetVapidPublicKey;
using OurGame.Application.Abstractions.Exceptions;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for managing Web Push subscriptions.
/// </summary>
public class PushSubscriptionFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<PushSubscriptionFunctions> _logger;

    public PushSubscriptionFunctions(IMediator mediator, ILogger<PushSubscriptionFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Returns the VAPID public key required by the browser to create a push subscription.
    /// This endpoint is accessible anonymously so the frontend can retrieve the key before auth.
    /// </summary>
    [Function("GetVapidPublicKey")]
    [OpenApiOperation(operationId: "GetVapidPublicKey", tags: new[] { "PushNotifications" }, Summary = "Get VAPID public key", Description = "Returns the server VAPID public key needed by the browser to subscribe to push notifications")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "VAPID public key returned successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "VAPID keys not configured")]
    public async Task<HttpResponseData> GetVapidPublicKey(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/push-subscriptions/vapid-public-key")] HttpRequestData req)
    {
        try
        {
            var publicKey = await _mediator.Send(new GetVapidPublicKeyQuery());
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<object>.SuccessResponse(new { publicKey }));
            return response;
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "VAPID public key not configured");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Push notifications are not configured.", (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Saves or updates a Web Push subscription for the authenticated user.
    /// </summary>
    [Function("SavePushSubscription")]
    [OpenApiOperation(operationId: "SavePushSubscription", tags: new[] { "PushNotifications" }, Summary = "Save push subscription", Description = "Registers or updates a browser push subscription for the authenticated user")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(SavePushSubscriptionRequest), Required = true, Description = "Push subscription from PushSubscription.toJSON()")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NoContent, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Subscription saved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invalid subscription data")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    public async Task<HttpResponseData> SavePushSubscription(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/push-subscriptions")] HttpRequestData req,
        CancellationToken ct = default)
    {
        var azureUserId = req.GetUserId();
        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        var dto = await req.ReadFromJsonAsync<SavePushSubscriptionRequest>(ct);
        if (dto == null)
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid request body.", (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            await _mediator.Send(new SavePushSubscriptionCommand(azureUserId, dto), ct);
            var response = req.CreateResponse(HttpStatusCode.NoContent);
            return response;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error saving push subscription");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<object>.ValidationErrorResponse("Validation failed", ex.Errors));
            return validationResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "User not found when saving push subscription");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving push subscription");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("An error occurred saving the push subscription.", (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Removes a Web Push subscription for the authenticated user.
    /// </summary>
    [Function("DeletePushSubscription")]
    [OpenApiOperation(operationId: "DeletePushSubscription", tags: new[] { "PushNotifications" }, Summary = "Delete push subscription", Description = "Removes a browser push subscription for the authenticated user")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(DeletePushSubscriptionRequest), Required = true, Description = "Endpoint to unsubscribe")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Subscription removed")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    public async Task<HttpResponseData> DeletePushSubscription(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "v1/push-subscriptions")] HttpRequestData req,
        CancellationToken ct = default)
    {
        var azureUserId = req.GetUserId();
        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        var dto = await req.ReadFromJsonAsync<DeletePushSubscriptionRequest>(ct);
        if (dto == null || string.IsNullOrWhiteSpace(dto.Endpoint))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Endpoint is required.", (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        await _mediator.Send(new DeletePushSubscriptionCommand(azureUserId, dto), ct);

        var response = req.CreateResponse(HttpStatusCode.NoContent);
        return response;
    }
}
