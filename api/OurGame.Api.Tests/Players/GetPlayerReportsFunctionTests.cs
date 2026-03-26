using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerReports;
using OurGame.Application.UseCases.Players.Queries.GetPlayerReports.DTOs;

namespace OurGame.Api.Tests.Players;

public class GetPlayerReportsFunctionTests
{
    [Fact]
    public async Task GetPlayerReports_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/players/some-id/reports");

        var response = await sut.GetPlayerReports(req, "some-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerReportSummaryDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerReports_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/players/not-a-guid/reports");

        var response = await sut.GetPlayerReports(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerReportSummaryDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid player ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetPlayerReports_ReturnsOk_WhenMediatorReturnsNull()
    {
        var playerId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetPlayerReportsQuery, List<PlayerReportSummaryDto>?>((_, _) =>
            Task.FromResult<List<PlayerReportSummaryDto>?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/reports");

        var response = await sut.GetPlayerReports(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerReportSummaryDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Empty(payload.Data!);
    }

    [Fact]
    public async Task GetPlayerReports_ReturnsOk_WhenReportsExist()
    {
        var playerId = Guid.NewGuid();
        var expected = new List<PlayerReportSummaryDto>
        {
            new() { Id = Guid.NewGuid() },
            new() { Id = Guid.NewGuid() }
        };

        var mediator = new TestMediator();
        mediator.Register<GetPlayerReportsQuery, List<PlayerReportSummaryDto>?>((_, _) =>
            Task.FromResult<List<PlayerReportSummaryDto>?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/reports");

        var response = await sut.GetPlayerReports(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerReportSummaryDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(2, payload.Data!.Count);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static GetPlayerReportsFunction BuildSut(TestMediator mediator)
    {
        return new GetPlayerReportsFunction(mediator, NullLogger<GetPlayerReportsFunction>.Instance);
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
