using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Clubs.Commands.UpsertClubSocialLinks;
using OurGame.Application.UseCases.Clubs.Queries.GetClubSocialLinks;
using OurGame.Application.UseCases.Clubs.Queries.GetClubSocialLinks.DTOs;

namespace OurGame.Api.Tests.Clubs;

public class ClubSocialLinksFunctionsTests
{
    // ── GetClubSocialLinks ───────────────────────────────────────────

    [Fact]
    public async Task GetClubSocialLinks_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", $"https://localhost/v1/clubs/{clubId}/social-links");

        var response = await sut.GetClubSocialLinks(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetClubSocialLinks_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/not-a-guid/social-links");

        var response = await sut.GetClubSocialLinks(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubSocialLinksDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubSocialLinks_ReturnsOk_WithNullData_WhenNoSocialLinksExist()
    {
        var clubId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetClubSocialLinksQuery, ClubSocialLinksDto?>((_, _) =>
            Task.FromResult<ClubSocialLinksDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/social-links");

        var response = await sut.GetClubSocialLinks(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubSocialLinksDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
    }

    [Fact]
    public async Task GetClubSocialLinks_ReturnsOk_WhenSocialLinksExist()
    {
        var clubId = Guid.NewGuid();
        var expected = new ClubSocialLinksDto
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            Website = "https://vale-fc.com",
            Twitter = "https://twitter.com/valefc",
            Instagram = "https://instagram.com/valefc"
        };

        var mediator = new TestMediator();
        mediator.Register<GetClubSocialLinksQuery, ClubSocialLinksDto?>((_, _) =>
            Task.FromResult<ClubSocialLinksDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/social-links");

        var response = await sut.GetClubSocialLinks(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubSocialLinksDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(clubId, payload.Data!.ClubId);
        Assert.Equal("https://vale-fc.com", payload.Data.Website);
    }

    // ── UpsertClubSocialLinks ────────────────────────────────────────

    [Fact]
    public async Task UpsertClubSocialLinks_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", $"https://localhost/v1/clubs/{clubId}/social-links", body: "{}");

        var response = await sut.UpsertClubSocialLinks(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpsertClubSocialLinks_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/clubs/not-a-guid/social-links", body: "{}");

        var response = await sut.UpsertClubSocialLinks(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubSocialLinksDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpsertClubSocialLinks_ReturnsNotFound_WhenClubNotFound()
    {
        var clubId = Guid.NewGuid();
        var body = "{\"Website\":\"https://vale-fc.com\"}";

        var mediator = new TestMediator();
        mediator.Register<UpsertClubSocialLinksCommand, ClubSocialLinksDto>((_, _) =>
            throw new NotFoundException("Club", clubId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/social-links", body: body);

        var response = await sut.UpsertClubSocialLinks(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubSocialLinksDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpsertClubSocialLinks_ReturnsOk_WhenSuccessful()
    {
        var clubId = Guid.NewGuid();
        var body = "{\"Website\":\"https://vale-fc.com\",\"Twitter\":\"https://twitter.com/valefc\"}";
        var expected = new ClubSocialLinksDto
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            Website = "https://vale-fc.com",
            Twitter = "https://twitter.com/valefc"
        };

        var mediator = new TestMediator();
        mediator.Register<UpsertClubSocialLinksCommand, ClubSocialLinksDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/social-links", body: body);

        var response = await sut.UpsertClubSocialLinks(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubSocialLinksDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(clubId, payload.Data!.ClubId);
        Assert.Equal("https://vale-fc.com", payload.Data.Website);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static ClubSocialLinksFunctions BuildSut(TestMediator mediator)
    {
        return new ClubSocialLinksFunctions(mediator, NullLogger<ClubSocialLinksFunctions>.Instance);
    }

    private static TestHttpRequestData CreateRequest(string method, string url, string? body = null)
    {
        return new TestHttpRequestData(TestFunctionContextFactory.Create(), method, url, body);
    }

    private static TestHttpRequestData CreateAuthedRequest(string method, string url, string? body = null)
    {
        var authId = Guid.NewGuid().ToString("N");
        var req = CreateRequest(method, url, body);
        req.AddClientPrincipalHeader(authId);
        return req;
    }
}
