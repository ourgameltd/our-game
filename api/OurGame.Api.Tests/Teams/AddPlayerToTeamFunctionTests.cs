using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Teams;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.AddPlayerToTeam;
using OurGame.Application.UseCases.Teams.Commands.AddPlayerToTeam.DTOs;

namespace OurGame.Api.Tests.Teams;

public class AddPlayerToTeamFunctionTests
{
    // ───────────────────────────────────────────────
    // AddPlayerToTeam
    // ───────────────────────────────────────────────

    [Fact]
    public async Task AddPlayerToTeam_ReturnsUnauthorized_WhenUserIdIsMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/teams/some-id/players");

        var response = await sut.AddPlayerToTeam(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AddPlayerToTeam_ReturnsBadRequest_WhenTeamIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/teams/not-a-guid/players", authId);

        var response = await sut.AddPlayerToTeam(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AddPlayerToTeamResultDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task AddPlayerToTeam_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/players", authId, body: "null");

        var response = await sut.AddPlayerToTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AddPlayerToTeamResultDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task AddPlayerToTeam_ReturnsNotFound_WhenResultIsNotFound()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var body = "{\"playerId\":\"" + playerId + "\",\"squadNumber\":7}";

        var mediator = new TestMediator();
        mediator.Register<AddPlayerToTeamCommand, Result<AddPlayerToTeamResultDto>>((_, _) =>
            Task.FromResult(Result<AddPlayerToTeamResultDto>.NotFound("Team not found")));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/players", authId, body);

        var response = await sut.AddPlayerToTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AddPlayerToTeamResultDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Team not found", payload.Error?.Message);
    }

    [Fact]
    public async Task AddPlayerToTeam_ReturnsBadRequest_WhenResultIsFailure()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var body = "{\"playerId\":\"" + playerId + "\",\"squadNumber\":7}";

        var mediator = new TestMediator();
        mediator.Register<AddPlayerToTeamCommand, Result<AddPlayerToTeamResultDto>>((_, _) =>
            Task.FromResult(Result<AddPlayerToTeamResultDto>.Failure("Player already assigned to team")));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/players", authId, body);

        var response = await sut.AddPlayerToTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AddPlayerToTeamResultDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Player already assigned to team", payload.Error?.Message);
    }

    [Fact]
    public async Task AddPlayerToTeam_ReturnsCreated_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var body = "{\"playerId\":\"" + playerId + "\",\"squadNumber\":7}";
        var expected = new AddPlayerToTeamResultDto
        {
            PlayerId = playerId,
            TeamId = teamId,
            SquadNumber = 7
        };

        var mediator = new TestMediator();
        mediator.Register<AddPlayerToTeamCommand, Result<AddPlayerToTeamResultDto>>((_, _) =>
            Task.FromResult(Result<AddPlayerToTeamResultDto>.Success(expected)));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/players", authId, body);

        var response = await sut.AddPlayerToTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AddPlayerToTeamResultDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(201, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(playerId, payload.Data!.PlayerId);
        Assert.Equal(teamId, payload.Data.TeamId);
        Assert.Equal(7, payload.Data.SquadNumber);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static AddPlayerToTeamFunction BuildSut(TestMediator mediator)
    {
        return new AddPlayerToTeamFunction(mediator, NullLogger<AddPlayerToTeamFunction>.Instance);
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
