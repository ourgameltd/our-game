using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAlbum;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAlbum.DTOs;

namespace OurGame.Api.Tests.Players;

public class GetPlayerAlbumFunctionTests
{
    [Fact]
    public async Task GetPlayerAlbum_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/players/some-id/album");

        var response = await sut.GetPlayerAlbum(req, "some-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerAlbum_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/players/not-a-guid/album");

        var response = await sut.GetPlayerAlbum(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid player ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetPlayerAlbum_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var playerId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetPlayerAlbumQuery, GetPlayerAlbumDto?>((_, _) =>
            Task.FromResult<GetPlayerAlbumDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/album");

        var response = await sut.GetPlayerAlbum(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerAlbum_ReturnsNotFound_WhenMediatorThrowsNotFoundException()
    {
        var playerId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetPlayerAlbumQuery, GetPlayerAlbumDto?>((_, _) =>
            throw new NotFoundException("Player not found"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/album");

        var response = await sut.GetPlayerAlbum(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerAlbum_ReturnsInternalServerError_WhenMediatorThrowsUnexpectedException()
    {
        var playerId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetPlayerAlbumQuery, GetPlayerAlbumDto?>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/album");

        var response = await sut.GetPlayerAlbum(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while retrieving the player album", payload.Error?.Message);
    }

    [Fact]
    public async Task GetPlayerAlbum_ReturnsOk_WhenAlbumExists()
    {
        var playerId = Guid.NewGuid();
        var expected = new GetPlayerAlbumDto { PlayerId = playerId };

        var mediator = new TestMediator();
        mediator.Register<GetPlayerAlbumQuery, GetPlayerAlbumDto?>((_, _) =>
            Task.FromResult<GetPlayerAlbumDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/album");

        var response = await sut.GetPlayerAlbum(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<GetPlayerAlbumDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(playerId, payload.Data!.PlayerId);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static GetPlayerAlbumFunction BuildSut(TestMediator mediator)
    {
        return new GetPlayerAlbumFunction(mediator, NullLogger<GetPlayerAlbumFunction>.Instance);
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
