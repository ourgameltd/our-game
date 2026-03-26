using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Teams;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Queries.GetDevelopmentPlansByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetDevelopmentPlansByTeamId.DTOs;

namespace OurGame.Api.Tests.Teams;

public class GetTeamDevelopmentPlansFunctionTests
{
    // ───────────────────────────────────────────────
    // GetTeamDevelopmentPlans
    // ───────────────────────────────────────────────

    [Fact]
    public async Task GetTeamDevelopmentPlans_ReturnsUnauthorized_WhenUserIdIsMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/teams/some-id/development-plans");

        var response = await sut.GetTeamDevelopmentPlans(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTeamDevelopmentPlans_ReturnsBadRequest_WhenTeamIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/teams/not-a-guid/development-plans", authId);

        var response = await sut.GetTeamDevelopmentPlans(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<TeamDevelopmentPlanDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamDevelopmentPlans_ReturnsNotFound_WhenKeyNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetDevelopmentPlansByTeamIdQuery, List<TeamDevelopmentPlanDto>>((_, _) =>
            throw new KeyNotFoundException("Team not found"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/development-plans", authId);

        var response = await sut.GetTeamDevelopmentPlans(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<TeamDevelopmentPlanDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Team not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamDevelopmentPlans_ReturnsOk_WhenTeamExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var expected = new List<TeamDevelopmentPlanDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                PlayerId = Guid.NewGuid(),
                Title = "Speed Development",
                Status = "active",
                CreatedAt = DateTime.UtcNow
            }
        };

        var mediator = new TestMediator();
        mediator.Register<GetDevelopmentPlansByTeamIdQuery, List<TeamDevelopmentPlanDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/development-plans", authId);

        var response = await sut.GetTeamDevelopmentPlans(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<TeamDevelopmentPlanDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
        Assert.Equal("Speed Development", payload.Data[0].Title);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static GetTeamDevelopmentPlansFunction BuildSut(TestMediator mediator)
    {
        return new GetTeamDevelopmentPlansFunction(mediator, NullLogger<GetTeamDevelopmentPlansFunction>.Instance);
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
