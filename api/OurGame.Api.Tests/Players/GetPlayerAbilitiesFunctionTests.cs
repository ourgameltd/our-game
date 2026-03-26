using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;

namespace OurGame.Api.Tests.Players;

public class GetPlayerAbilitiesFunctionTests
{
    [Fact]
    public async Task GetPlayerAbilities_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/players/some-id/abilities");

        var response = await sut.GetPlayerAbilities(req, "some-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilitiesDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerAbilities_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/players/not-a-guid/abilities");

        var response = await sut.GetPlayerAbilities(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilitiesDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid player ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetPlayerAbilities_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var playerId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetPlayerAbilitiesQuery, PlayerAbilitiesDto?>((_, _) =>
            Task.FromResult<PlayerAbilitiesDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/abilities");

        var response = await sut.GetPlayerAbilities(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilitiesDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerAbilities_ReturnsOk_WhenAbilitiesExist()
    {
        var playerId = Guid.NewGuid();
        var expected = new PlayerAbilitiesDto { Id = playerId };

        var mediator = new TestMediator();
        mediator.Register<GetPlayerAbilitiesQuery, PlayerAbilitiesDto?>((_, _) =>
            Task.FromResult<PlayerAbilitiesDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/abilities");

        var response = await sut.GetPlayerAbilities(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilitiesDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(playerId, payload.Data!.Id);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static GetPlayerAbilitiesFunction BuildSut(TestMediator mediator)
    {
        return new GetPlayerAbilitiesFunction(mediator, NullLogger<GetPlayerAbilitiesFunction>.Instance);
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
