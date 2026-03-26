using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Teams;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Commands.AssignCoachToTeam;
using OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs;

namespace OurGame.Api.Tests.Teams;

public class AssignTeamCoachFunctionTests
{
    // ───────────────────────────────────────────────
    // AssignTeamCoach
    // ───────────────────────────────────────────────

    [Fact]
    public async Task AssignTeamCoach_ReturnsUnauthorized_WhenUserIdIsMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/teams/some-id/coaches");

        var response = await sut.AssignTeamCoach(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AssignTeamCoach_ReturnsBadRequest_WhenTeamIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/teams/not-a-guid/coaches", authId);

        var response = await sut.AssignTeamCoach(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task AssignTeamCoach_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/coaches", authId, body: "null");

        var response = await sut.AssignTeamCoach(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task AssignTeamCoach_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();
        var body = "{\"coachId\":\"" + coachId + "\",\"role\":\"headcoach\"}";

        var mediator = new TestMediator();
        mediator.Register<AssignCoachToTeamCommand, TeamCoachDto>((_, _) =>
            throw new NotFoundException("Team", teamId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/coaches", authId, body);

        var response = await sut.AssignTeamCoach(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task AssignTeamCoach_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();
        var body = "{\"coachId\":\"" + coachId + "\",\"role\":\"headcoach\"}";

        var mediator = new TestMediator();
        mediator.Register<AssignCoachToTeamCommand, TeamCoachDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["CoachId"] = new[] { "Coach is already assigned to this team." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/coaches", authId, body);

        var response = await sut.AssignTeamCoach(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task AssignTeamCoach_ReturnsInternalServerError_WhenExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();
        var body = "{\"coachId\":\"" + coachId + "\",\"role\":\"headcoach\"}";

        var mediator = new TestMediator();
        mediator.Register<AssignCoachToTeamCommand, TeamCoachDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/coaches", authId, body);

        var response = await sut.AssignTeamCoach(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while assigning the coach to the team", payload.Error?.Message);
    }

    [Fact]
    public async Task AssignTeamCoach_ReturnsCreated_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();
        var body = "{\"coachId\":\"" + coachId + "\",\"role\":\"headcoach\"}";
        var expected = new TeamCoachDto
        {
            Id = coachId,
            FirstName = "John",
            LastName = "Doe"
        };

        var mediator = new TestMediator();
        mediator.Register<AssignCoachToTeamCommand, TeamCoachDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/coaches", authId, body);

        var response = await sut.AssignTeamCoach(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamCoachDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(201, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(coachId, payload.Data!.Id);
        Assert.Equal("John", payload.Data.FirstName);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static AssignTeamCoachFunction BuildSut(TestMediator mediator)
    {
        return new AssignTeamCoachFunction(mediator, NullLogger<AssignTeamCoachFunction>.Instance);
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
