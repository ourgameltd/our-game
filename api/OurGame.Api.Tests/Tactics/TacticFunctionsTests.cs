using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticsByScope.DTOs;

namespace OurGame.Api.Tests.Tactics;

public class TacticFunctionsTests
{
    // ── GetTacticsByClub ────────────────────────────────────────────────

    [Fact]
    public async Task GetTacticsByClub_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/clubs/00000000-0000-0000-0000-000000000001/tactics");

        var response = await sut.GetTacticsByClub(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTacticsByClub_ReturnsBadRequest_WhenClubIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/not-a-guid/tactics", authId);

        var response = await sut.GetTacticsByClub(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTacticsByClub_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var expected = new TacticsByScopeResponseDto();

        var mediator = new TestMediator();
        mediator.Register<GetTacticsByScopeQuery, TacticsByScopeResponseDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/tactics", authId);

        var response = await sut.GetTacticsByClub(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticsByScopeResponseDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetTacticsByAgeGroup ────────────────────────────────────────────

    [Fact]
    public async Task GetTacticsByAgeGroup_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var req = CreateRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/tactics");

        var response = await sut.GetTacticsByAgeGroup(req, clubId.ToString(), ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTacticsByAgeGroup_ReturnsBadRequest_WhenClubIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/not-a-guid/age-groups/{ageGroupId}/tactics", authId);

        var response = await sut.GetTacticsByAgeGroup(req, "not-a-guid", ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTacticsByAgeGroup_ReturnsBadRequest_WhenAgeGroupIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/not-a-guid/tactics", authId);

        var response = await sut.GetTacticsByAgeGroup(req, clubId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTacticsByAgeGroup_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var expected = new TacticsByScopeResponseDto();

        var mediator = new TestMediator();
        mediator.Register<GetTacticsByScopeQuery, TacticsByScopeResponseDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/tactics", authId);

        var response = await sut.GetTacticsByAgeGroup(req, clubId.ToString(), ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticsByScopeResponseDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetTacticsByTeam ────────────────────────────────────────────────

    [Fact]
    public async Task GetTacticsByTeam_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var req = CreateRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/tactics");

        var response = await sut.GetTacticsByTeam(req, clubId.ToString(), ageGroupId.ToString(), teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTacticsByTeam_ReturnsBadRequest_WhenClubIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/not-a-guid/age-groups/{ageGroupId}/teams/{teamId}/tactics", authId);

        var response = await sut.GetTacticsByTeam(req, "not-a-guid", ageGroupId.ToString(), teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTacticsByTeam_ReturnsBadRequest_WhenAgeGroupIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/not-a-guid/teams/{teamId}/tactics", authId);

        var response = await sut.GetTacticsByTeam(req, clubId.ToString(), "not-a-guid", teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTacticsByTeam_ReturnsBadRequest_WhenTeamIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/not-a-guid/tactics", authId);

        var response = await sut.GetTacticsByTeam(req, clubId.ToString(), ageGroupId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticsByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTacticsByTeam_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var expected = new TacticsByScopeResponseDto();

        var mediator = new TestMediator();
        mediator.Register<GetTacticsByScopeQuery, TacticsByScopeResponseDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/tactics", authId);

        var response = await sut.GetTacticsByTeam(req, clubId.ToString(), ageGroupId.ToString(), teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticsByScopeResponseDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static TacticFunctions BuildSut(TestMediator mediator)
    {
        return new TacticFunctions(mediator, NullLogger<TacticFunctions>.Instance);
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
