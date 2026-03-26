using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Teams;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamPlayerSquadNumber;

namespace OurGame.Api.Tests.Teams;

public class UpdateTeamPlayerSquadNumberFunctionTests
{
    // ───────────────────────────────────────────────
    // UpdateTeamPlayerSquadNumber
    // ───────────────────────────────────────────────

    [Fact]
    public async Task UpdateTeamPlayerSquadNumber_ReturnsUnauthorized_WhenUserIdIsMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/teams/tid/players/pid/squad-number");

        var response = await sut.UpdateTeamPlayerSquadNumber(req, Guid.NewGuid().ToString(), Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTeamPlayerSquadNumber_ReturnsBadRequest_WhenTeamIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/teams/not-a-guid/players/some-id/squad-number", authId);

        var response = await sut.UpdateTeamPlayerSquadNumber(req, "not-a-guid", Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ReadBodyAsString(response);
        Assert.Contains("Invalid team ID format", body);
    }

    [Fact]
    public async Task UpdateTeamPlayerSquadNumber_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/players/not-a-guid/squad-number", authId);

        var response = await sut.UpdateTeamPlayerSquadNumber(req, teamId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ReadBodyAsString(response);
        Assert.Contains("Invalid player ID format", body);
    }

    [Fact]
    public async Task UpdateTeamPlayerSquadNumber_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/players/{playerId}/squad-number", authId, body: "null");

        var response = await sut.UpdateTeamPlayerSquadNumber(req, teamId.ToString(), playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ReadBodyAsString(response);
        Assert.Contains("Invalid request body", body);
    }

    [Fact]
    public async Task UpdateTeamPlayerSquadNumber_ReturnsNotFound_WhenResultIsNotFound()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var requestBody = "{\"squadNumber\":10}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamPlayerSquadNumberCommand, Result>((_, _) =>
            Task.FromResult(Result.NotFound("Player assignment not found")));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/players/{playerId}/squad-number", authId, requestBody);

        var response = await sut.UpdateTeamPlayerSquadNumber(req, teamId.ToString(), playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var body = await ReadBodyAsString(response);
        Assert.Contains("Player assignment not found", body);
    }

    [Fact]
    public async Task UpdateTeamPlayerSquadNumber_ReturnsBadRequest_WhenResultIsFailure()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var requestBody = "{\"squadNumber\":10}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamPlayerSquadNumberCommand, Result>((_, _) =>
            Task.FromResult(Result.Failure("Squad number already in use")));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/players/{playerId}/squad-number", authId, requestBody);

        var response = await sut.UpdateTeamPlayerSquadNumber(req, teamId.ToString(), playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ReadBodyAsString(response);
        Assert.Contains("Squad number already in use", body);
    }

    [Fact]
    public async Task UpdateTeamPlayerSquadNumber_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var playerId = Guid.NewGuid();
        var requestBody = "{\"squadNumber\":10}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamPlayerSquadNumberCommand, Result>((_, _) =>
            Task.FromResult(Result.Success()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/players/{playerId}/squad-number", authId, requestBody);

        var response = await sut.UpdateTeamPlayerSquadNumber(req, teamId.ToString(), playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static UpdateTeamPlayerSquadNumberFunction BuildSut(TestMediator mediator)
    {
        return new UpdateTeamPlayerSquadNumberFunction(mediator, NullLogger<UpdateTeamPlayerSquadNumberFunction>.Instance);
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
