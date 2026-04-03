using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Notifications.Commands.MarkAllNotificationsAsRead;
using OurGame.Application.UseCases.Notifications.Commands.MarkNotificationAsRead;
using OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications;
using OurGame.Application.UseCases.Notifications.Queries.GetMyNotifications.DTOs;

namespace OurGame.Api.Tests.Notifications;

public class NotificationFunctionsTests
{
    [Fact]
    public async Task GetMyNotifications_ReturnsUnauthorized_WhenClientPrincipalMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/notifications");

        var response = await sut.GetMyNotifications(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMyNotifications_ReturnsOk_WhenAuthenticated()
    {
        var authId = Guid.NewGuid().ToString("N");
        var mediator = new TestMediator();
        mediator.Register<GetMyNotificationsQuery, List<NotificationDto>>((_, _) =>
            Task.FromResult(new List<NotificationDto>
            {
                new() { Id = Guid.NewGuid(), Type = "announcement", Title = "t", Message = "m", CreatedAt = DateTime.UtcNow, IsRead = false }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", "https://localhost/v1/notifications?unreadOnly=true", authId);

        var response = await sut.GetMyNotifications(req);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task MarkNotificationAsRead_ReturnsNoContent_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var notificationId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<MarkNotificationAsReadCommand, bool>((_, _) => Task.FromResult(true));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/notifications/{notificationId}/read", authId, "{}");

        var response = await sut.MarkNotificationAsRead(req, notificationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task MarkNotificationAsRead_ReturnsBadRequest_WhenIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/notifications/not-guid/read", authId, "{}");

        var response = await sut.MarkNotificationAsRead(req, "not-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task MarkAllNotificationsAsRead_ReturnsNoContent_WhenAuthenticated()
    {
        var authId = Guid.NewGuid().ToString("N");
        var mediator = new TestMediator();
        mediator.Register<MarkAllNotificationsAsReadCommand, int>((_, _) => Task.FromResult(1));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/notifications/read-all", authId, "{}");

        var response = await sut.MarkAllNotificationsAsRead(req);

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task MarkNotificationAsRead_ReturnsNotFound_WhenNotificationMissing()
    {
        var authId = Guid.NewGuid().ToString("N");
        var notificationId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<MarkNotificationAsReadCommand, bool>((_, _) => throw new NotFoundException("Notification", notificationId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/notifications/{notificationId}/read", authId, "{}");

        var response = await sut.MarkNotificationAsRead(req, notificationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    private static NotificationFunctions BuildSut(TestMediator mediator)
    {
        return new NotificationFunctions(mediator, NullLogger<NotificationFunctions>.Instance);
    }

    private static TestHttpRequestData CreateRequest(string method, string url, string? body = null)
    {
        return new TestHttpRequestData(TestFunctionContextFactory.Create(), method, url, body);
    }

    private static TestHttpRequestData CreateAuthedRequest(string method, string url, string authId, string? body = null)
    {
        var req = CreateRequest(method, url, body);
        req.AddClientPrincipalHeader(authId);
        return req;
    }
}
