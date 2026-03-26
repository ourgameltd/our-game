using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerById;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerById.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;

namespace OurGame.Api.Tests.Players;

public class UpdatePlayerFunctionTests
{
    [Fact]
    public async Task UpdatePlayer_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/players/some-id");

        var response = await sut.UpdatePlayer(req, "some-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task UpdatePlayer_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/players/not-a-guid");

        var response = await sut.UpdatePlayer(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid player ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdatePlayer_ReturnsBadRequest_WhenBodyIsNull()
    {
        var playerId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}", "null");

        var response = await sut.UpdatePlayer(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdatePlayer_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var playerId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new UpdatePlayerRequestDto());

        var mediator = new TestMediator();
        mediator.Register<UpdatePlayerCommand, PlayerDto?>((_, _) =>
            Task.FromResult<PlayerDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}", body);

        var response = await sut.UpdatePlayer(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Player not found", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdatePlayer_ReturnsNotFound_WhenMediatorThrowsNotFoundException()
    {
        var playerId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new UpdatePlayerRequestDto());

        var mediator = new TestMediator();
        mediator.Register<UpdatePlayerCommand, PlayerDto?>((_, _) =>
            throw new NotFoundException("Player not found"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}", body);

        var response = await sut.UpdatePlayer(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdatePlayer_ReturnsBadRequest_WhenMediatorThrowsValidationException()
    {
        var playerId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new UpdatePlayerRequestDto());

        var mediator = new TestMediator();
        mediator.Register<UpdatePlayerCommand, PlayerDto?>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["FirstName"] = new[] { "First name is required" }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}", body);

        var response = await sut.UpdatePlayer(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdatePlayer_ReturnsOk_WhenRequestIsValid()
    {
        var playerId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new UpdatePlayerRequestDto());
        var expected = new PlayerDto { Id = playerId };

        var mediator = new TestMediator();
        mediator.Register<UpdatePlayerCommand, PlayerDto?>((_, _) =>
            Task.FromResult<PlayerDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}", body);

        var response = await sut.UpdatePlayer(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(playerId, payload.Data!.Id);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static UpdatePlayerFunction BuildSut(TestMediator mediator)
    {
        return new UpdatePlayerFunction(mediator, NullLogger<UpdatePlayerFunction>.Instance);
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
