using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Tactics;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

namespace OurGame.Api.Tests.Tactics;

public class GetTacticByIdFunctionTests
{
    // ── GetTacticById ───────────────────────────────────────────────────

    [Fact]
    public async Task GetTacticById_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/tactics/00000000-0000-0000-0000-000000000001");

        var response = await sut.GetTacticById(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTacticById_ReturnsBadRequest_WhenIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/tactics/not-a-guid", authId);

        var response = await sut.GetTacticById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid tactic ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTacticById_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var tacticId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetTacticByIdQuery, TacticDetailDto?>((_, _) =>
            Task.FromResult<TacticDetailDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/tactics/{tacticId}", authId);

        var response = await sut.GetTacticById(req, tacticId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Tactic not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTacticById_ReturnsOk_WhenTacticExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var tacticId = Guid.NewGuid();
        var expected = new TacticDetailDto { Id = tacticId };

        var mediator = new TestMediator();
        mediator.Register<GetTacticByIdQuery, TacticDetailDto?>((_, _) =>
            Task.FromResult<TacticDetailDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/tactics/{tacticId}", authId);

        var response = await sut.GetTacticById(req, tacticId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(tacticId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static GetTacticByIdFunction BuildSut(TestMediator mediator)
    {
        return new GetTacticByIdFunction(mediator, NullLogger<GetTacticByIdFunction>.Instance);
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
