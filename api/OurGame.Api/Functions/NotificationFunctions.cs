using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Notifications.Commands.MarkAllNotificationsAsRead;
using OurGame.Application.UseCases.Notifications.Commands.MarkNotificationAsRead;
using OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications;
using OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

public class NotificationFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<NotificationFunctions> _logger;

    public NotificationFunctions(IMediator mediator, ILogger<NotificationFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [Function("GetMyNotifications")]
    [OpenApiOperation(operationId: "GetMyNotifications", tags: new[] { "Notifications" }, Summary = "Get my notifications", Description = "Returns global and user-specific notifications for current user")]
    [OpenApiParameter(name: "unreadOnly", In = ParameterLocation.Query, Required = false, Type = typeof(bool), Description = "Return unread notifications only")]
    [OpenApiParameter(name: "readOnly", In = ParameterLocation.Query, Required = false, Type = typeof(bool), Description = "Return read notifications only")]
    [OpenApiParameter(name: "page", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Page number (1-based, default 1)")]
    [OpenApiParameter(name: "pageSize", In = ParameterLocation.Query, Required = false, Type = typeof(int), Description = "Items per page (default 20, max 50)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PagedResponse<NotificationDto>>), Description = "Notifications retrieved")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    public async Task<HttpResponseData> GetMyNotifications(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/notifications")] HttpRequestData req,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        var unreadOnly = bool.TryParse(req.GetQueryParam("unreadOnly"), out var unreadParsed) && unreadParsed;
        var readOnly = bool.TryParse(req.GetQueryParam("readOnly"), out var readParsed) && readParsed;
        var page = int.TryParse(req.GetQueryParam("page"), out var pageParsed) ? Math.Max(1, pageParsed) : 1;
        var pageSize = int.TryParse(req.GetQueryParam("pageSize"), out var sizeParsed) ? Math.Clamp(sizeParsed, 1, 50) : 20;

        try
        {
            var result = await _mediator.Send(new GetMyNotificationsQuery(authId, unreadOnly, readOnly, page, pageSize), ct);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(ApiResponse<PagedResponse<NotificationDto>>.SuccessResponse(result), ct);
            return response;
        }
        catch (NotFoundException ex)
        {
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFound;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get notifications");
            var error = req.CreateResponse(HttpStatusCode.InternalServerError);
            await error.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Failed to retrieve notifications", 500), ct);
            return error;
        }
    }

    [Function("MarkNotificationAsRead")]
    [OpenApiOperation(operationId: "MarkNotificationAsRead", tags: new[] { "Notifications" }, Summary = "Mark notification as read", Description = "Marks one notification as viewed for current user")]
    [OpenApiParameter(name: "notificationId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "Notification ID")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Notification marked as read")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    public async Task<HttpResponseData> MarkNotificationAsRead(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/notifications/{notificationId}/read")] HttpRequestData req,
        string notificationId,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        if (!Guid.TryParse(notificationId, out var notificationGuid))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid notification ID format", 400), ct);
            return badRequest;
        }

        try
        {
            await _mediator.Send(new MarkNotificationAsReadCommand(authId, notificationGuid), ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (ValidationException ex)
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(ApiResponse<object>.ValidationErrorResponse("Validation failed", ex.Errors), ct);
            return badRequest;
        }
        catch (NotFoundException ex)
        {
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFound;
        }
    }

    [Function("MarkAllNotificationsAsRead")]
    [OpenApiOperation(operationId: "MarkAllNotificationsAsRead", tags: new[] { "Notifications" }, Summary = "Mark all notifications as read", Description = "Marks all visible notifications as viewed for current user")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Notifications marked as read")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    public async Task<HttpResponseData> MarkAllNotificationsAsRead(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/notifications/read-all")] HttpRequestData req,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        await _mediator.Send(new MarkAllNotificationsAsReadCommand(authId), ct);
        return req.CreateResponse(HttpStatusCode.NoContent);
    }
}
