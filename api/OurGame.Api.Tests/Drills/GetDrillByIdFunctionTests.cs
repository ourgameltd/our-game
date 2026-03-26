using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Drills;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;

namespace OurGame.Api.Tests.Drills;

public class GetDrillByIdFunctionTests
{
    // ── GetDrillById ────────────────────────────────────────────────────

    [Fact]
    public async Task GetDrillById_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/drills/00000000-0000-0000-0000-000000000001");

        var response = await sut.GetDrillById(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDrillById_ReturnsBadRequest_WhenDrillIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/drills/not-a-guid", authId);

        var response = await sut.GetDrillById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid drill ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillById_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var drillId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetDrillByIdQuery, DrillDetailDto?>((_, _) =>
            Task.FromResult<DrillDetailDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/drills/{drillId}", authId);

        var response = await sut.GetDrillById(req, drillId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Drill not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillById_ReturnsOk_WhenDrillExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var drillId = Guid.NewGuid();
        var expected = new DrillDetailDto { Id = drillId };

        var mediator = new TestMediator();
        mediator.Register<GetDrillByIdQuery, DrillDetailDto?>((_, _) =>
            Task.FromResult<DrillDetailDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/drills/{drillId}", authId);

        var response = await sut.GetDrillById(req, drillId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(drillId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static GetDrillByIdFunction BuildSut(TestMediator mediator)
    {
        return new GetDrillByIdFunction(mediator, NullLogger<GetDrillByIdFunction>.Instance);
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
