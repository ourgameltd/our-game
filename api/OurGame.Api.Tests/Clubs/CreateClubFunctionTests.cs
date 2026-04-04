using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Clubs.Commands.CreateClub;
using OurGame.Application.UseCases.Clubs.Commands.CreateClub.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;

namespace OurGame.Api.Tests.Clubs;

public class CreateClubFunctionTests
{
    [Fact]
    public async Task CreateClub_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/clubs", "{}");

        var response = await sut.CreateClub(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateClub_ReturnsForbidden_WhenUserIsNotAdmin()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/clubs", body: "{}");

        var response = await sut.CreateClub(req);

        Assert.Equal(System.Net.HttpStatusCode.Forbidden, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(403, payload.StatusCode);
        Assert.Equal("Admin access required", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateClub_ReturnsBadRequest_WhenRequestBodyIsEmpty()
    {
        var mediator = new TestMediator();
        mediator.Register<CreateClubCommand, ClubDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "Name", new[] { "Name is required." } }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAdminRequest("POST", "https://localhost/v1/clubs", "{}");

        var response = await sut.CreateClub(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateClub_ReturnsBadRequest_WhenValidationFails()
    {
        var mediator = new TestMediator();
        mediator.Register<CreateClubCommand, ClubDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "Name", new[] { "Name is required." } }
            }));

        var body = JsonSerializer.Serialize(new { name = "", shortName = "VFC", city = "Stoke", country = "GB", venue = "Vale Park" });
        var sut = BuildSut(mediator);
        var req = CreateAdminRequest("POST", "https://localhost/v1/clubs", body);

        var response = await sut.CreateClub(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal("Validation failed", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateClub_ReturnsCreated_WhenRequestIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new ClubDetailDto
        {
            Id = clubId,
            Name = "Vale FC",
            ShortName = "VFC",
            Colors = new ClubColorsDto { Primary = "#ff0000", Secondary = "#ffffff", Accent = "#000000" },
            Location = new ClubLocationDto { City = "Stoke", Country = "GB", Venue = "Vale Park", Address = "" }
        };

        var mediator = new TestMediator();
        mediator.Register<CreateClubCommand, ClubDetailDto>((_, _) => Task.FromResult(expected));

        var body = JsonSerializer.Serialize(new
        {
            name = "Vale FC",
            shortName = "VFC",
            primaryColor = "#ff0000",
            secondaryColor = "#ffffff",
            accentColor = "#000000",
            city = "Stoke",
            country = "GB",
            venue = "Vale Park"
        });

        var sut = BuildSut(mediator);
        var req = CreateAdminRequest("POST", "https://localhost/v1/clubs", body);

        var response = await sut.CreateClub(req);

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(201, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(clubId, payload.Data!.Id);
        Assert.Equal("Vale FC", payload.Data.Name);
    }

    [Fact]
    public async Task CreateClub_ReturnsInternalServerError_WhenUnexpectedExceptionOccurs()
    {
        var mediator = new TestMediator();
        mediator.Register<CreateClubCommand, ClubDetailDto>((_, _) =>
            throw new Exception("Database failure"));

        var body = JsonSerializer.Serialize(new { name = "Vale FC", shortName = "VFC", city = "Stoke", country = "GB", venue = "Vale Park" });
        var sut = BuildSut(mediator);
        var req = CreateAdminRequest("POST", "https://localhost/v1/clubs", body);

        var response = await sut.CreateClub(req);

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
    }

    // --- Helpers ---

    private static ClubFunctions BuildSut(TestMediator mediator)
        => new(mediator, NullLogger<ClubFunctions>.Instance);

    private static TestHttpRequestData CreateRequest(string method, string url, string? body = null)
        => new(TestFunctionContextFactory.Create(), method, url, body);

    private static TestHttpRequestData CreateAuthedRequest(string method, string url, string? body = null)
    {
        var req = CreateRequest(method, url, body);
        req.AddClientPrincipalHeader(Guid.NewGuid().ToString("N"));
        return req;
    }

    private static TestHttpRequestData CreateAdminRequest(string method, string url, string? body = null)
    {
        var req = CreateRequest(method, url, body);
        req.AddClientPrincipalHeader(Guid.NewGuid().ToString("N"), roles: new[] { "authenticated", "admin" });
        return req;
    }
}
