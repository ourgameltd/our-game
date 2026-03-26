using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Teams;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeam;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;

namespace OurGame.Api.Tests.Teams;

public class UpdateTeamFunctionTests
{
    // ───────────────────────────────────────────────
    // UpdateTeam
    // ───────────────────────────────────────────────

    [Fact]
    public async Task UpdateTeam_ReturnsUnauthorized_WhenUserIdIsMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/teams/some-id");

        var response = await sut.UpdateTeam(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTeam_ReturnsBadRequest_WhenTeamIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/teams/not-a-guid", authId);

        var response = await sut.UpdateTeam(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewTeamDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeam_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}", authId, body: "null");

        var response = await sut.UpdateTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewTeamDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeam_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"name\":\"Updated Reds\",\"level\":\"youth\",\"season\":\"2025\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamCommand, TeamOverviewTeamDto>((_, _) =>
            throw new NotFoundException("Team", teamId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}", authId, body);

        var response = await sut.UpdateTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewTeamDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateTeam_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"name\":\"\",\"level\":\"youth\",\"season\":\"2025\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamCommand, TeamOverviewTeamDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}", authId, body);

        var response = await sut.UpdateTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewTeamDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateTeam_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"name\":\"Updated Reds\",\"level\":\"youth\",\"season\":\"2025\"}";
        var expected = new TeamOverviewTeamDto
        {
            Id = teamId,
            ClubId = Guid.NewGuid(),
            AgeGroupId = Guid.NewGuid(),
            Name = "Updated Reds",
            Level = "youth",
            Season = "2025"
        };

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamCommand, TeamOverviewTeamDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}", authId, body);

        var response = await sut.UpdateTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewTeamDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(teamId, payload.Data!.Id);
        Assert.Equal("Updated Reds", payload.Data.Name);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static UpdateTeamFunction BuildSut(TestMediator mediator)
    {
        return new UpdateTeamFunction(mediator, NullLogger<UpdateTeamFunction>.Instance);
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
