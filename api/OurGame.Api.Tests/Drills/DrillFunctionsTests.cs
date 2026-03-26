using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Drills.Queries.GetDrillsByScope;
using OurGame.Application.UseCases.Drills.Queries.GetDrillsByScope.DTOs;

namespace OurGame.Api.Tests.Drills;

public class DrillFunctionsTests
{
    // ── GetDrillsByClub ─────────────────────────────────────────────────

    [Fact]
    public async Task GetDrillsByClub_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/clubs/00000000-0000-0000-0000-000000000001/drills");

        var response = await sut.GetDrillsByClub(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDrillsByClub_ReturnsBadRequest_WhenClubIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/not-a-guid/drills", authId);

        var response = await sut.GetDrillsByClub(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillsByClub_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var expected = new DrillsByScopeResponseDto();

        var mediator = new TestMediator();
        mediator.Register<GetDrillsByScopeQuery, DrillsByScopeResponseDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/drills", authId);

        var response = await sut.GetDrillsByClub(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillsByScopeResponseDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetDrillsByAgeGroup ─────────────────────────────────────────────

    [Fact]
    public async Task GetDrillsByAgeGroup_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var req = CreateRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/drills");

        var response = await sut.GetDrillsByAgeGroup(req, clubId.ToString(), ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDrillsByAgeGroup_ReturnsBadRequest_WhenClubIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/not-a-guid/age-groups/{ageGroupId}/drills", authId);

        var response = await sut.GetDrillsByAgeGroup(req, "not-a-guid", ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillsByAgeGroup_ReturnsBadRequest_WhenAgeGroupIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/not-a-guid/drills", authId);

        var response = await sut.GetDrillsByAgeGroup(req, clubId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillsByAgeGroup_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var expected = new DrillsByScopeResponseDto();

        var mediator = new TestMediator();
        mediator.Register<GetDrillsByScopeQuery, DrillsByScopeResponseDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/drills", authId);

        var response = await sut.GetDrillsByAgeGroup(req, clubId.ToString(), ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillsByScopeResponseDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetDrillsByTeam ─────────────────────────────────────────────────

    [Fact]
    public async Task GetDrillsByTeam_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var req = CreateRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/drills");

        var response = await sut.GetDrillsByTeam(req, clubId.ToString(), ageGroupId.ToString(), teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDrillsByTeam_ReturnsBadRequest_WhenClubIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/not-a-guid/age-groups/{ageGroupId}/teams/{teamId}/drills", authId);

        var response = await sut.GetDrillsByTeam(req, "not-a-guid", ageGroupId.ToString(), teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillsByTeam_ReturnsBadRequest_WhenAgeGroupIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/not-a-guid/teams/{teamId}/drills", authId);

        var response = await sut.GetDrillsByTeam(req, clubId.ToString(), "not-a-guid", teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillsByTeam_ReturnsBadRequest_WhenTeamIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/not-a-guid/drills", authId);

        var response = await sut.GetDrillsByTeam(req, clubId.ToString(), ageGroupId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillsByTeam_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var expected = new DrillsByScopeResponseDto();

        var mediator = new TestMediator();
        mediator.Register<GetDrillsByScopeQuery, DrillsByScopeResponseDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/drills", authId);

        var response = await sut.GetDrillsByTeam(req, clubId.ToString(), ageGroupId.ToString(), teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillsByScopeResponseDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static DrillFunctions BuildSut(TestMediator mediator)
    {
        return new DrillFunctions(mediator, NullLogger<DrillFunctions>.Instance);
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
