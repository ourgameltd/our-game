using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Teams;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.CreateTeam;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;

namespace OurGame.Api.Tests.Teams;

public class CreateTeamFunctionTests
{
    // ───────────────────────────────────────────────
    // CreateTeam
    // ───────────────────────────────────────────────

    [Fact]
    public async Task CreateTeam_ReturnsUnauthorized_WhenUserIdIsMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/teams");

        var response = await sut.CreateTeam(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateTeam_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/teams", authId, body: "null");

        var response = await sut.CreateTeam(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewTeamDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateTeam_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var body = "{\"clubId\":\"" + clubId + "\",\"ageGroupId\":\"" + ageGroupId + "\",\"name\":\"Reds\",\"level\":\"youth\",\"season\":\"2025\",\"primaryColor\":\"#FF0000\",\"secondaryColor\":\"#FFFFFF\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateTeamCommand, TeamOverviewTeamDto>((_, _) =>
            throw new NotFoundException("Club", clubId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/teams", authId, body);

        var response = await sut.CreateTeam(req);

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewTeamDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task CreateTeam_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var body = "{\"clubId\":\"" + clubId + "\",\"ageGroupId\":\"" + ageGroupId + "\",\"name\":\"\",\"level\":\"youth\",\"season\":\"2025\",\"primaryColor\":\"#FF0000\",\"secondaryColor\":\"#FFFFFF\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateTeamCommand, TeamOverviewTeamDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/teams", authId, body);

        var response = await sut.CreateTeam(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewTeamDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateTeam_ReturnsInternalServerError_WhenExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var body = "{\"clubId\":\"" + clubId + "\",\"ageGroupId\":\"" + ageGroupId + "\",\"name\":\"Reds\",\"level\":\"youth\",\"season\":\"2025\",\"primaryColor\":\"#FF0000\",\"secondaryColor\":\"#FFFFFF\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateTeamCommand, TeamOverviewTeamDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/teams", authId, body);

        var response = await sut.CreateTeam(req);

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewTeamDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the team", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateTeam_ReturnsCreated_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var body = "{\"clubId\":\"" + clubId + "\",\"ageGroupId\":\"" + ageGroupId + "\",\"name\":\"Reds\",\"level\":\"youth\",\"season\":\"2025\",\"primaryColor\":\"#FF0000\",\"secondaryColor\":\"#FFFFFF\"}";
        var expected = new TeamOverviewTeamDto
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            AgeGroupId = ageGroupId,
            Name = "Reds",
            Level = "youth",
            Season = "2025"
        };

        var mediator = new TestMediator();
        mediator.Register<CreateTeamCommand, TeamOverviewTeamDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/teams", authId, body);

        var response = await sut.CreateTeam(req);

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewTeamDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(201, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
        Assert.Equal("Reds", payload.Data.Name);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static CreateTeamFunction BuildSut(TestMediator mediator)
    {
        return new CreateTeamFunction(mediator, NullLogger<CreateTeamFunction>.Instance);
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
