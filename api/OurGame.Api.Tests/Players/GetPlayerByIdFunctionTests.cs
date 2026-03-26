using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;

namespace OurGame.Api.Tests.Players;

public class GetPlayerByIdFunctionTests
{
    [Fact]
    public async Task GetPlayerById_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/players/some-id");

        var response = await sut.GetPlayerById(req, "some-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerById_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/players/not-a-guid");

        var response = await sut.GetPlayerById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid player ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetPlayerById_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var playerId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetPlayerByIdQuery, PlayerDto?>((_, _) =>
            Task.FromResult<PlayerDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}");

        var response = await sut.GetPlayerById(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Player not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetPlayerById_ReturnsOk_WhenPlayerExists()
    {
        var playerId = Guid.NewGuid();
        var expected = new PlayerDto { Id = playerId };

        var mediator = new TestMediator();
        mediator.Register<GetPlayerByIdQuery, PlayerDto?>((_, _) =>
            Task.FromResult<PlayerDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}");

        var response = await sut.GetPlayerById(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(playerId, payload.Data!.Id);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static GetPlayerByIdFunction BuildSut(TestMediator mediator)
    {
        return new GetPlayerByIdFunction(mediator, NullLogger<GetPlayerByIdFunction>.Instance);
    }

    private static TestHttpRequestData CreateRequest(string method, string url, string? body = null)
    {
        return new TestHttpRequestData(TestFunctionContextFactory.Create(), method, url, body);
    }

    private static TestHttpRequestData CreateAuthedRequest(string method, string url, string? body = null)
    {
        var authId = Guid.NewGuid().ToString("N");
        var req = CreateRequest(method, url, body);
        req.AddClientPrincipalHeader(authId);
        return req;
    }
}
