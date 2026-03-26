using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope.DTOs;

namespace OurGame.Api.Tests.DrillTemplates;

public class DrillTemplateFunctionsTests
{
    // ── GetDrillTemplatesByClub ─────────────────────────────────────────

    [Fact]
    public async Task GetDrillTemplatesByClub_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/clubs/00000000-0000-0000-0000-000000000001/drill-templates");

        var response = await sut.GetDrillTemplatesByClub(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDrillTemplatesByClub_ReturnsBadRequest_WhenClubIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/not-a-guid/drill-templates", authId);

        var response = await sut.GetDrillTemplatesByClub(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplatesByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillTemplatesByClub_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var expected = new DrillTemplatesByScopeResponseDto();

        var mediator = new TestMediator();
        mediator.Register<GetDrillTemplatesByScopeQuery, DrillTemplatesByScopeResponseDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/drill-templates", authId);

        var response = await sut.GetDrillTemplatesByClub(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplatesByScopeResponseDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetDrillTemplatesByAgeGroup ─────────────────────────────────────

    [Fact]
    public async Task GetDrillTemplatesByAgeGroup_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var req = CreateRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/drill-templates");

        var response = await sut.GetDrillTemplatesByAgeGroup(req, clubId.ToString(), ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDrillTemplatesByAgeGroup_ReturnsBadRequest_WhenClubIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/not-a-guid/age-groups/{ageGroupId}/drill-templates", authId);

        var response = await sut.GetDrillTemplatesByAgeGroup(req, "not-a-guid", ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplatesByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillTemplatesByAgeGroup_ReturnsBadRequest_WhenAgeGroupIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/not-a-guid/drill-templates", authId);

        var response = await sut.GetDrillTemplatesByAgeGroup(req, clubId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplatesByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillTemplatesByAgeGroup_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var expected = new DrillTemplatesByScopeResponseDto();

        var mediator = new TestMediator();
        mediator.Register<GetDrillTemplatesByScopeQuery, DrillTemplatesByScopeResponseDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/drill-templates", authId);

        var response = await sut.GetDrillTemplatesByAgeGroup(req, clubId.ToString(), ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplatesByScopeResponseDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetDrillTemplatesByTeam ─────────────────────────────────────────

    [Fact]
    public async Task GetDrillTemplatesByTeam_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var req = CreateRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/drill-templates");

        var response = await sut.GetDrillTemplatesByTeam(req, clubId.ToString(), ageGroupId.ToString(), teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDrillTemplatesByTeam_ReturnsBadRequest_WhenClubIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/not-a-guid/age-groups/{ageGroupId}/teams/{teamId}/drill-templates", authId);

        var response = await sut.GetDrillTemplatesByTeam(req, "not-a-guid", ageGroupId.ToString(), teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplatesByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillTemplatesByTeam_ReturnsBadRequest_WhenAgeGroupIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/not-a-guid/teams/{teamId}/drill-templates", authId);

        var response = await sut.GetDrillTemplatesByTeam(req, clubId.ToString(), "not-a-guid", teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplatesByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillTemplatesByTeam_ReturnsBadRequest_WhenTeamIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/not-a-guid/drill-templates", authId);

        var response = await sut.GetDrillTemplatesByTeam(req, clubId.ToString(), ageGroupId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplatesByScopeResponseDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillTemplatesByTeam_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var expected = new DrillTemplatesByScopeResponseDto();

        var mediator = new TestMediator();
        mediator.Register<GetDrillTemplatesByScopeQuery, DrillTemplatesByScopeResponseDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups/{ageGroupId}/teams/{teamId}/drill-templates", authId);

        var response = await sut.GetDrillTemplatesByTeam(req, clubId.ToString(), ageGroupId.ToString(), teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplatesByScopeResponseDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static DrillTemplateFunctions BuildSut(TestMediator mediator)
    {
        return new DrillTemplateFunctions(mediator, NullLogger<DrillTemplateFunctions>.Instance);
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
