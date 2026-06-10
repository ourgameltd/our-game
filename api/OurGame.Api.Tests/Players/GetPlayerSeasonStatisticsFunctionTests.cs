using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerSeasonStatistics.DTOs;

namespace OurGame.Api.Tests.Players;

public class GetPlayerSeasonStatisticsFunctionTests
{
    [Fact]
    public async Task GetPlayerSeasonStatistics_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/players/some-id/season-statistics");

        var response = await sut.GetPlayerSeasonStatistics(req, "some-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerSeasonStatisticsDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerSeasonStatistics_ReturnsBadRequest_WhenPlayerIdIsInvalidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/players/not-a-guid/season-statistics");

        var response = await sut.GetPlayerSeasonStatistics(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerSeasonStatisticsDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid player ID format", payload.Error?.Message);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static GetPlayerSeasonStatisticsFunction BuildSut(TestMediator mediator)
        => new(mediator, NullLogger<GetPlayerSeasonStatisticsFunction>.Instance, null!);

    private static TestHttpRequestData CreateRequest(string method, string url)
        => new(TestFunctionContextFactory.Create(), method, url, null);

    private static TestHttpRequestData CreateAuthedRequest(string method, string url)
    {
        var req = CreateRequest(method, url);
        req.AddClientPrincipalHeader(Guid.NewGuid().ToString("N"));
        return req;
    }
}
