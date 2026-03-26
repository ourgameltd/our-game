using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.CreateDevelopmentPlan;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.CreateDevelopmentPlan.DTOs;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.UpdateDevelopmentPlan;
using OurGame.Application.UseCases.DevelopmentPlans.Commands.UpdateDevelopmentPlan.DTOs;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;

namespace OurGame.Api.Tests.DevelopmentPlans;

public class DevelopmentPlanFunctionsTests
{
    // ── CreateDevelopmentPlan ────────────────────────────────────────────

    [Fact]
    public async Task CreateDevelopmentPlan_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/development-plans");

        var response = await sut.CreateDevelopmentPlan(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateDevelopmentPlan_ReturnsBadRequest_WhenBodyDeserializesToNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/development-plans", authId, body: "null");

        var response = await sut.CreateDevelopmentPlan(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateDevelopmentPlan_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<CreateDevelopmentPlanCommand, DevelopmentPlanDto>((_, _) =>
            throw new NotFoundException("Player", Guid.NewGuid().ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/development-plans", authId, body);

        var response = await sut.CreateDevelopmentPlan(req);

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task CreateDevelopmentPlan_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<CreateDevelopmentPlanCommand, DevelopmentPlanDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["PlayerId"] = new[] { "Player ID is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/development-plans", authId, body);

        var response = await sut.CreateDevelopmentPlan(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateDevelopmentPlan_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<CreateDevelopmentPlanCommand, DevelopmentPlanDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/development-plans", authId, body);

        var response = await sut.CreateDevelopmentPlan(req);

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the development plan", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateDevelopmentPlan_ReturnsCreated_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{}";
        var expected = new DevelopmentPlanDto { Id = Guid.NewGuid() };

        var mediator = new TestMediator();
        mediator.Register<CreateDevelopmentPlanCommand, DevelopmentPlanDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/development-plans", authId, body);

        var response = await sut.CreateDevelopmentPlan(req);

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
    }

    // ── UpdateDevelopmentPlan ────────────────────────────────────────────

    [Fact]
    public async Task UpdateDevelopmentPlan_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/development-plans/00000000-0000-0000-0000-000000000001");

        var response = await sut.UpdateDevelopmentPlan(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDevelopmentPlan_ReturnsBadRequest_WhenIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/development-plans/not-a-guid", authId, body: "{}");

        var response = await sut.UpdateDevelopmentPlan(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid development plan ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDevelopmentPlan_ReturnsBadRequest_WhenBodyDeserializesToNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var planId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/development-plans/{planId}", authId, body: "null");

        var response = await sut.UpdateDevelopmentPlan(req, planId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDevelopmentPlan_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var planId = Guid.NewGuid();
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<UpdateDevelopmentPlanCommand, DevelopmentPlanDto>((_, _) =>
            throw new NotFoundException("DevelopmentPlan", planId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/development-plans/{planId}", authId, body);

        var response = await sut.UpdateDevelopmentPlan(req, planId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateDevelopmentPlan_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var planId = Guid.NewGuid();
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<UpdateDevelopmentPlanCommand, DevelopmentPlanDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Title"] = new[] { "Title is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/development-plans/{planId}", authId, body);

        var response = await sut.UpdateDevelopmentPlan(req, planId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateDevelopmentPlan_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var planId = Guid.NewGuid();
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<UpdateDevelopmentPlanCommand, DevelopmentPlanDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/development-plans/{planId}", authId, body);

        var response = await sut.UpdateDevelopmentPlan(req, planId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the development plan", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDevelopmentPlan_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var planId = Guid.NewGuid();
        var body = "{}";
        var expected = new DevelopmentPlanDto { Id = planId };

        var mediator = new TestMediator();
        mediator.Register<UpdateDevelopmentPlanCommand, DevelopmentPlanDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/development-plans/{planId}", authId, body);

        var response = await sut.UpdateDevelopmentPlan(req, planId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static DevelopmentPlanFunctions BuildSut(TestMediator mediator)
    {
        return new DevelopmentPlanFunctions(mediator, NullLogger<DevelopmentPlanFunctions>.Instance);
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
