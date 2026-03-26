using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerUpcomingMatches;
using OurGame.Application.UseCases.Players.Queries.GetPlayerUpcomingMatches.DTOs;

namespace OurGame.Api.Tests.Players;

public class GetPlayerUpcomingMatchesFunctionTests
{
    [Fact]
    public async Task GetPlayerUpcomingMatches_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/players/some-id/upcoming-matches");

        var response = await sut.GetPlayerUpcomingMatches(req, "some-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerUpcomingMatchDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerUpcomingMatches_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/players/not-a-guid/upcoming-matches");

        var response = await sut.GetPlayerUpcomingMatches(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerUpcomingMatchDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid player ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetPlayerUpcomingMatches_ReturnsOk_WhenMediatorReturnsNull()
    {
        var playerId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetPlayerUpcomingMatchesQuery, List<PlayerUpcomingMatchDto>?>((_, _) =>
            Task.FromResult<List<PlayerUpcomingMatchDto>?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/upcoming-matches");

        var response = await sut.GetPlayerUpcomingMatches(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerUpcomingMatchDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Empty(payload.Data!);
    }

    [Fact]
    public async Task GetPlayerUpcomingMatches_ReturnsOk_WhenMatchesExist()
    {
        var playerId = Guid.NewGuid();
        var expected = new List<PlayerUpcomingMatchDto>
        {
            new() { MatchId = Guid.NewGuid() },
            new() { MatchId = Guid.NewGuid() }
        };

        var mediator = new TestMediator();
        mediator.Register<GetPlayerUpcomingMatchesQuery, List<PlayerUpcomingMatchDto>?>((_, _) =>
            Task.FromResult<List<PlayerUpcomingMatchDto>?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/upcoming-matches");

        var response = await sut.GetPlayerUpcomingMatches(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerUpcomingMatchDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(2, payload.Data!.Count);
    }

    [Fact]
    public async Task GetPlayerUpcomingMatches_ReturnsOk_WhenLimitQueryParameterIsProvided()
    {
        var playerId = Guid.NewGuid();
        var expected = new List<PlayerUpcomingMatchDto>
        {
            new() { MatchId = Guid.NewGuid() },
            new() { MatchId = Guid.NewGuid() },
            new() { MatchId = Guid.NewGuid() }
        };

        var mediator = new TestMediator();
        mediator.Register<GetPlayerUpcomingMatchesQuery, List<PlayerUpcomingMatchDto>?>((_, _) =>
            Task.FromResult<List<PlayerUpcomingMatchDto>?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/upcoming-matches?limit=5");

        var response = await sut.GetPlayerUpcomingMatches(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerUpcomingMatchDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(3, payload.Data!.Count);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static GetPlayerUpcomingMatchesFunction BuildSut(TestMediator mediator)
    {
        return new GetPlayerUpcomingMatchesFunction(mediator, NullLogger<GetPlayerUpcomingMatchesFunction>.Instance);
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
