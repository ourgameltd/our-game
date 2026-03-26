using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Teams;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamCoachRole;
using OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs;

namespace OurGame.Api.Tests.Teams;

public class UpdateTeamCoachRoleFunctionTests
{
    // ───────────────────────────────────────────────
    // UpdateTeamCoachRole
    // ───────────────────────────────────────────────

    [Fact]
    public async Task UpdateTeamCoachRole_ReturnsUnauthorized_WhenUserIdIsMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/teams/tid/coaches/cid/role");

        var response = await sut.UpdateTeamCoachRole(req, Guid.NewGuid().ToString(), Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTeamCoachRole_ReturnsBadRequest_WhenTeamIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/teams/not-a-guid/coaches/some-id/role", authId);

        var response = await sut.UpdateTeamCoachRole(req, "not-a-guid", Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeamCoachRole_ReturnsBadRequest_WhenCoachIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/coaches/not-a-guid/role", authId);

        var response = await sut.UpdateTeamCoachRole(req, teamId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid coach ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeamCoachRole_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/coaches/{coachId}/role", authId, body: "null");

        var response = await sut.UpdateTeamCoachRole(req, teamId.ToString(), coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeamCoachRole_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();
        var body = "{\"role\":\"assistantcoach\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamCoachRoleCommand, TeamCoachDto>((_, _) =>
            throw new NotFoundException("Coach", coachId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/coaches/{coachId}/role", authId, body);

        var response = await sut.UpdateTeamCoachRole(req, teamId.ToString(), coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateTeamCoachRole_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();
        var body = "{\"role\":\"invalidrole\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamCoachRoleCommand, TeamCoachDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Role"] = new[] { "Invalid role specified." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/coaches/{coachId}/role", authId, body);

        var response = await sut.UpdateTeamCoachRole(req, teamId.ToString(), coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateTeamCoachRole_ReturnsInternalServerError_WhenExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();
        var body = "{\"role\":\"assistantcoach\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamCoachRoleCommand, TeamCoachDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/coaches/{coachId}/role", authId, body);

        var response = await sut.UpdateTeamCoachRole(req, teamId.ToString(), coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the coach role", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeamCoachRole_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();
        var body = "{\"role\":\"assistantcoach\"}";
        var expected = new TeamCoachDto
        {
            Id = coachId,
            FirstName = "Jane",
            LastName = "Smith"
        };

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamCoachRoleCommand, TeamCoachDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/coaches/{coachId}/role", authId, body);

        var response = await sut.UpdateTeamCoachRole(req, teamId.ToString(), coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(coachId, payload.Data!.Id);
        Assert.Equal("Jane", payload.Data.FirstName);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static UpdateTeamCoachRoleFunction BuildSut(TestMediator mediator)
    {
        return new UpdateTeamCoachRoleFunction(mediator, NullLogger<UpdateTeamCoachRoleFunction>.Instance);
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
