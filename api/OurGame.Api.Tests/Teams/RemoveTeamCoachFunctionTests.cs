using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Teams;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Teams.Commands.RemoveCoachFromTeam;

namespace OurGame.Api.Tests.Teams;

public class RemoveTeamCoachFunctionTests
{
    // ───────────────────────────────────────────────
    // RemoveTeamCoach
    // ───────────────────────────────────────────────

    [Fact]
    public async Task RemoveTeamCoach_ReturnsUnauthorized_WhenUserIdIsMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("DELETE", "https://localhost/v1/teams/tid/coaches/cid");

        var response = await sut.RemoveTeamCoach(req, Guid.NewGuid().ToString(), Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RemoveTeamCoach_ReturnsBadRequest_WhenTeamIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", "https://localhost/v1/teams/not-a-guid/coaches/some-id", authId);

        var response = await sut.RemoveTeamCoach(req, "not-a-guid", Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RemoveTeamCoach_ReturnsBadRequest_WhenCoachIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/coaches/not-a-guid", authId);

        var response = await sut.RemoveTeamCoach(req, teamId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RemoveTeamCoach_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<RemoveCoachFromTeamCommand>((_, _) =>
            throw new NotFoundException("Coach", coachId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/coaches/{coachId}", authId);

        var response = await sut.RemoveTeamCoach(req, teamId.ToString(), coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task RemoveTeamCoach_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<RemoveCoachFromTeamCommand>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Team"] = new[] { "Team is archived." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/coaches/{coachId}", authId);

        var response = await sut.RemoveTeamCoach(req, teamId.ToString(), coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RemoveTeamCoach_ReturnsInternalServerError_WhenExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<RemoveCoachFromTeamCommand>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/coaches/{coachId}", authId);

        var response = await sut.RemoveTeamCoach(req, teamId.ToString(), coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task RemoveTeamCoach_ReturnsNoContent_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var coachId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<RemoveCoachFromTeamCommand>((_, _) => Task.CompletedTask);

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/coaches/{coachId}", authId);

        var response = await sut.RemoveTeamCoach(req, teamId.ToString(), coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static RemoveTeamCoachFunction BuildSut(TestMediator mediator)
    {
        return new RemoveTeamCoachFunction(mediator, NullLogger<RemoveTeamCoachFunction>.Instance);
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
