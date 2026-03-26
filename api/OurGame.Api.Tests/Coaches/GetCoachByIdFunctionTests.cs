using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Coaches;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;

namespace OurGame.Api.Tests.Coaches;

public class GetCoachByIdFunctionTests
{
    // ── GetCoachById ────────────────────────────────────────────────────

    [Fact]
    public async Task GetCoachById_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/coaches/00000000-0000-0000-0000-000000000001");

        var response = await sut.GetCoachById(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<CoachDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task GetCoachById_ReturnsBadRequest_WhenCoachIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/coaches/not-a-guid", authId);

        var response = await sut.GetCoachById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<CoachDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid coach ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetCoachById_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var coachId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetCoachByIdQuery, CoachDetailDto?>((_, _) =>
            Task.FromResult<CoachDetailDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/coaches/{coachId}", authId);

        var response = await sut.GetCoachById(req, coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<CoachDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Coach not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetCoachById_ReturnsOk_WhenCoachExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var coachId = Guid.NewGuid();
        var expected = new CoachDetailDto { Id = coachId };

        var mediator = new TestMediator();
        mediator.Register<GetCoachByIdQuery, CoachDetailDto?>((_, _) =>
            Task.FromResult<CoachDetailDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/coaches/{coachId}", authId);

        var response = await sut.GetCoachById(req, coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<CoachDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(coachId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static GetCoachByIdFunction BuildSut(TestMediator mediator)
    {
        return new GetCoachByIdFunction(mediator, NullLogger<GetCoachByIdFunction>.Instance);
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
