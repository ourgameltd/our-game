using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Teams;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.RemovePlayerFromTeam;

namespace OurGame.Api.Tests.Teams;

public class RemovePlayerFromTeamFunctionTests
{
    // ───────────────────────────────────────────────
    // RemovePlayerFromTeam
    // ───────────────────────────────────────────────

    [Fact]
    public async Task RemovePlayerFromTeam_ReturnsUnauthorized_WhenUserIdIsMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("DELETE", "https://localhost/v1/teams/tid/players/pid");

        var response = await sut.RemovePlayerFromTeam(req, Guid.NewGuid().ToString(), Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RemovePlayerFromTeam_ReturnsBadRequest_WhenTeamIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", "https://localhost/v1/teams/not-a-guid/players/some-id", authId);

        var response = await sut.RemovePlayerFromTeam(req, "not-a-guid", Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ReadBodyAsString(response);
        Assert.Contains("Invalid team ID format", body);
    }

    [Fact]
    public async Task RemovePlayerFromTeam_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/players/not-a-guid", authId);

        var response = await sut.RemovePlayerFromTeam(req, teamId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ReadBodyAsString(response);
        Assert.Contains("Invalid player ID format", body);
    }

    [Fact]
    public async Task RemovePlayerFromTeam_ReturnsNotFound_WhenResultIsNotFound()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var playerId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<RemovePlayerFromTeamCommand, Result>((_, _) =>
            Task.FromResult(Result.NotFound("Player assignment not found")));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/players/{playerId}", authId);

        var response = await sut.RemovePlayerFromTeam(req, teamId.ToString(), playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var body = await ReadBodyAsString(response);
        Assert.Contains("Player assignment not found", body);
    }

    [Fact]
    public async Task RemovePlayerFromTeam_ReturnsBadRequest_WhenResultIsFailure()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var playerId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<RemovePlayerFromTeamCommand, Result>((_, _) =>
            Task.FromResult(Result.Failure("Cannot remove player from archived team")));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/players/{playerId}", authId);

        var response = await sut.RemovePlayerFromTeam(req, teamId.ToString(), playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ReadBodyAsString(response);
        Assert.Contains("Cannot remove player from archived team", body);
    }

    [Fact]
    public async Task RemovePlayerFromTeam_ReturnsNoContent_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var playerId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<RemovePlayerFromTeamCommand, Result>((_, _) =>
            Task.FromResult(Result.Success()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/players/{playerId}", authId);

        var response = await sut.RemovePlayerFromTeam(req, teamId.ToString(), playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static RemovePlayerFromTeamFunction BuildSut(TestMediator mediator)
    {
        return new RemovePlayerFromTeamFunction(mediator, NullLogger<RemovePlayerFromTeamFunction>.Instance);
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

    private static async Task<string> ReadBodyAsString(Microsoft.Azure.Functions.Worker.Http.HttpResponseData response)
    {
        response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(response.Body);
        return await reader.ReadToEndAsync();
    }
}
