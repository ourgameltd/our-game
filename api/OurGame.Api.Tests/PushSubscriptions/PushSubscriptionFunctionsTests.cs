using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.PushSubscriptions.Commands.DeletePushSubscription;
using OurGame.Application.UseCases.PushSubscriptions.Commands.DeletePushSubscription.DTOs;
using OurGame.Application.UseCases.PushSubscriptions.Commands.SavePushSubscription;
using OurGame.Application.UseCases.PushSubscriptions.Commands.SavePushSubscription.DTOs;
using OurGame.Application.UseCases.PushSubscriptions.Queries.GetVapidPublicKey;

namespace OurGame.Api.Tests.PushSubscriptions;

public class PushSubscriptionFunctionsTests
{
    // ── GetVapidPublicKey ────────────────────────────────────────────────────────

    [Fact]
    public async Task GetVapidPublicKey_ReturnsOk_WithPublicKey()
    {
        const string expectedKey = "BNxIBq_test_public_key_base64url";
        var mediator = new TestMediator();
        mediator.Register<GetVapidPublicKeyQuery, string>((_, _) => Task.FromResult(expectedKey));

        var sut = BuildSut(mediator);
        var req = CreateRequest("GET", "https://localhost/v1/push-subscriptions/vapid-public-key");

        var response = await sut.GetVapidPublicKey(req);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetVapidPublicKey_ReturnsInternalServerError_WhenVapidNotConfigured()
    {
        var mediator = new TestMediator();
        mediator.Register<GetVapidPublicKeyQuery, string>((_, _) =>
            throw new InvalidOperationException("VAPID public key is not configured."));

        var sut = BuildSut(mediator);
        var req = CreateRequest("GET", "https://localhost/v1/push-subscriptions/vapid-public-key");

        var response = await sut.GetVapidPublicKey(req);

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
    }

    // ── SavePushSubscription ─────────────────────────────────────────────────────

    [Fact]
    public async Task SavePushSubscription_ReturnsUnauthorized_WhenClientPrincipalMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/push-subscriptions",
            "{\"endpoint\":\"https://fcm.googleapis.com/test\",\"keys\":{\"p256dh\":\"key\",\"auth\":\"auth\"}}");

        var response = await sut.SavePushSubscription(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task SavePushSubscription_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/push-subscriptions", authId, body: "null");

        var response = await sut.SavePushSubscription(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SavePushSubscription_ReturnsNoContent_WhenSubscriptionSaved()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"Endpoint\":\"https://fcm.googleapis.com/test\",\"Keys\":{\"P256dh\":\"Bkey\",\"Auth\":\"authsecret\"}}";

        var mediator = new TestMediator();
        mediator.Register<SavePushSubscriptionCommand>((_, _) => Task.CompletedTask);

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/push-subscriptions", authId, body);

        var response = await sut.SavePushSubscription(req);

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task SavePushSubscription_ReturnsBadRequest_WhenValidationFails()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"Endpoint\":\"\",\"Keys\":{\"P256dh\":\"\",\"Auth\":\"\"}}";

        var mediator = new TestMediator();
        mediator.Register<SavePushSubscriptionCommand>((_, _) =>
            throw new ValidationException("Endpoint", "Endpoint is required."));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/push-subscriptions", authId, body);

        var response = await sut.SavePushSubscription(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ── DeletePushSubscription ───────────────────────────────────────────────────

    [Fact]
    public async Task DeletePushSubscription_ReturnsUnauthorized_WhenClientPrincipalMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("DELETE", "https://localhost/v1/push-subscriptions",
            "{\"endpoint\":\"https://fcm.googleapis.com/test\"}");

        var response = await sut.DeletePushSubscription(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeletePushSubscription_ReturnsNoContent_WhenSubscriptionRemoved()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"Endpoint\":\"https://fcm.googleapis.com/test\"}";

        var mediator = new TestMediator();
        mediator.Register<DeletePushSubscriptionCommand>((_, _) => Task.CompletedTask);

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", "https://localhost/v1/push-subscriptions", authId, body);

        var response = await sut.DeletePushSubscription(req);

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeletePushSubscription_ReturnsBadRequest_WhenEndpointMissing()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"Endpoint\":\"\"}";

        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", "https://localhost/v1/push-subscriptions", authId, body);

        var response = await sut.DeletePushSubscription(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private static PushSubscriptionFunctions BuildSut(TestMediator mediator)
    {
        return new PushSubscriptionFunctions(mediator, NullLogger<PushSubscriptionFunctions>.Instance);
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
