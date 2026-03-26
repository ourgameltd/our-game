using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Clubs;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubById;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;

namespace OurGame.Api.Tests.Clubs;

public class UpdateClubFunctionTests
{
    // ── UpdateClub ──────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateClub_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/clubs/00000000-0000-0000-0000-000000000001", "{}");

        var response = await sut.UpdateClub(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateClub_ReturnsBadRequest_WhenClubIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/clubs/not-a-guid", authId, "{}");

        var response = await sut.UpdateClub(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateClub_ReturnsBadRequest_WhenRequestBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}", authId, "null");

        var response = await sut.UpdateClub(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateClub_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateClubCommand, ClubDetailDto>((_, _) =>
            throw new NotFoundException("Club", clubId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}", authId, "{}");

        var response = await sut.UpdateClub(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateClub_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateClubCommand, ClubDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}", authId, "{}");

        var response = await sut.UpdateClub(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateClub_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateClubCommand, ClubDetailDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}", authId, "{}");

        var response = await sut.UpdateClub(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An unexpected error occurred", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateClub_ReturnsOk_WhenUpdateSucceeds()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var expected = new ClubDetailDto { Id = clubId, Name = "Vale FC" };

        var mediator = new TestMediator();
        mediator.Register<UpdateClubCommand, ClubDetailDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}", authId, "{}");

        var response = await sut.UpdateClub(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(clubId, payload.Data!.Id);
        Assert.Equal("Vale FC", payload.Data.Name);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static UpdateClubFunction BuildSut(TestMediator mediator)
    {
        return new UpdateClubFunction(mediator, NullLogger<UpdateClubFunction>.Instance);
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
