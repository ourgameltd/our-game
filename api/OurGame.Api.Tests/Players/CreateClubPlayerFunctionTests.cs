using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.CreatePlayer;
using OurGame.Application.UseCases.Players.Commands.CreatePlayer.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerById.DTOs;

namespace OurGame.Api.Tests.Players;

public class CreateClubPlayerFunctionTests
{
    [Fact]
    public async Task CreateClubPlayer_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/clubs/some-id/players");

        var response = await sut.CreateClubPlayer(req, "some-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task CreateClubPlayer_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/clubs/not-a-guid/players");

        var response = await sut.CreateClubPlayer(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateClubPlayer_ReturnsBadRequest_WhenBodyIsNull()
    {
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/players", "null");

        var response = await sut.CreateClubPlayer(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateClubPlayer_ReturnsNotFound_WhenMediatorThrowsNotFoundException()
    {
        var clubId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new CreatePlayerRequestDto());

        var mediator = new TestMediator();
        mediator.Register<CreatePlayerCommand, PlayerDto>((_, _) =>
            throw new NotFoundException("Club not found"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/players", body);

        var response = await sut.CreateClubPlayer(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task CreateClubPlayer_ReturnsBadRequest_WhenMediatorThrowsValidationException()
    {
        var clubId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new CreatePlayerRequestDto());

        var mediator = new TestMediator();
        mediator.Register<CreatePlayerCommand, PlayerDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["FirstName"] = new[] { "First name is required" }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/players", body);

        var response = await sut.CreateClubPlayer(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateClubPlayer_ReturnsInternalServerError_WhenMediatorThrowsUnexpectedException()
    {
        var clubId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new CreatePlayerRequestDto());

        var mediator = new TestMediator();
        mediator.Register<CreatePlayerCommand, PlayerDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/players", body);

        var response = await sut.CreateClubPlayer(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the player", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateClubPlayer_ReturnsCreated_WhenRequestIsValid()
    {
        var clubId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new CreatePlayerRequestDto());
        var expected = new PlayerDto { Id = playerId };

        var mediator = new TestMediator();
        mediator.Register<CreatePlayerCommand, PlayerDto>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/players", body);

        var response = await sut.CreateClubPlayer(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(201, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(playerId, payload.Data!.Id);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static CreateClubPlayerFunction BuildSut(TestMediator mediator)
    {
        return new CreateClubPlayerFunction(mediator, NullLogger<CreateClubPlayerFunction>.Instance);
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
