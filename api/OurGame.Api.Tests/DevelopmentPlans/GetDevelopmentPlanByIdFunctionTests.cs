using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.DevelopmentPlans;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById;
using OurGame.Application.UseCases.DevelopmentPlans.Queries.GetDevelopmentPlanById.DTOs;

namespace OurGame.Api.Tests.DevelopmentPlans;

public class GetDevelopmentPlanByIdFunctionTests
{
    // ── GetDevelopmentPlanById ───────────────────────────────────────────

    [Fact]
    public async Task GetDevelopmentPlanById_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/development-plans/00000000-0000-0000-0000-000000000001");

        var response = await sut.GetDevelopmentPlanById(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDevelopmentPlanById_ReturnsBadRequest_WhenIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/development-plans/not-a-guid", authId);

        var response = await sut.GetDevelopmentPlanById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid development plan ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDevelopmentPlanById_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var planId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetDevelopmentPlanByIdQuery, DevelopmentPlanDetailDto?>((_, _) =>
            Task.FromResult<DevelopmentPlanDetailDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/development-plans/{planId}", authId);

        var response = await sut.GetDevelopmentPlanById(req, planId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Development plan not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDevelopmentPlanById_ReturnsOk_WhenPlanExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var planId = Guid.NewGuid();
        var expected = new DevelopmentPlanDetailDto { Id = planId };

        var mediator = new TestMediator();
        mediator.Register<GetDevelopmentPlanByIdQuery, DevelopmentPlanDetailDto?>((_, _) =>
            Task.FromResult<DevelopmentPlanDetailDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/development-plans/{planId}", authId);

        var response = await sut.GetDevelopmentPlanById(req, planId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DevelopmentPlanDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(planId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static GetDevelopmentPlanByIdFunction BuildSut(TestMediator mediator)
    {
        return new GetDevelopmentPlanByIdFunction(mediator, NullLogger<GetDevelopmentPlanByIdFunction>.Instance);
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
