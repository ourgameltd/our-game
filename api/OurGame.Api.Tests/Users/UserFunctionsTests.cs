using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Players.Queries.GetMyChildren;
using OurGame.Application.UseCases.Players.Queries.GetMyChildren.DTOs;
using OurGame.Application.UseCases.Users.Commands.UpdateMyProfile;
using OurGame.Application.UseCases.Users.Commands.UpdateMyProfile.DTOs;
using OurGame.Application.UseCases.Users.Queries.GetMyClubs;
using OurGame.Application.UseCases.Users.Queries.GetMyClubs.DTOs;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs;

namespace OurGame.Api.Tests.Users;

public class UserFunctionsTests
{
    [Fact]
    public async Task GetMe_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/users/me");

        var response = await sut.GetMe(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<UserProfileDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("User not authenticated", payload.Error?.Message);
    }

    [Fact]
    public async Task GetMe_ReturnsNotFound_WhenUserDoesNotExist()
    {
        var authId = Guid.NewGuid().ToString("N");
        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, UserProfileDto?>((_, _) => Task.FromResult<UserProfileDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", "https://localhost/v1/users/me", authId);

        var response = await sut.GetMe(req);

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<UserProfileDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("User profile not found in database", payload.Error?.Message);
    }

    [Fact]
    public async Task GetMe_ReturnsOk_WhenUserExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var expected = new UserProfileDto
        {
            Id = Guid.NewGuid(),
            AuthId = authId,
            FirstName = "Jamie",
            LastName = "Coach",
            Email = "jamie.coach@ourgame.local"
        };

        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, UserProfileDto?>((query, _) =>
            Task.FromResult<UserProfileDto?>(query.AuthId == authId ? expected : null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", "https://localhost/v1/users/me", authId);

        var response = await sut.GetMe(req);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<UserProfileDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
    }

    [Fact]
    public async Task GetMyChildren_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/users/me/children");

        var response = await sut.GetMyChildren(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMyChildren_ReturnsOk_WhenAuthenticated()
    {
        var authId = Guid.NewGuid().ToString("N");
        var expected = new List<ChildPlayerDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ClubId = Guid.NewGuid(),
                FirstName = "Alex",
                LastName = "Smith",
                PreferredPositions = "CM"
            }
        };

        var mediator = new TestMediator();
        mediator.Register<GetMyChildrenQuery, List<ChildPlayerDto>>((query, _) =>
            Task.FromResult(query.AuthId == authId ? expected : new List<ChildPlayerDto>()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", "https://localhost/v1/users/me/children", authId);

        var response = await sut.GetMyChildren(req);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ChildPlayerDto>>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
        Assert.Equal("Alex", payload.Data[0].FirstName);
    }

    [Fact]
    public async Task GetMyClubs_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/users/me/clubs");

        var response = await sut.GetMyClubs(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMyClubs_ReturnsOk_WhenAuthenticated()
    {
        var authId = Guid.NewGuid().ToString("N");
        var expected = new List<MyClubListItemDto>
        {
            new(
                Guid.NewGuid(),
                "Vale FC",
                "Vale",
                "/logos/vale.png",
                "#D3202A",
                "#FFFFFF",
                "#1A1A1A",
                "Manchester",
                "England",
                8,
                186)
        };

        var mediator = new TestMediator();
        mediator.Register<GetMyClubsQuery, List<MyClubListItemDto>>((query, _) =>
            Task.FromResult(query.AzureUserId == authId ? expected : new List<MyClubListItemDto>()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", "https://localhost/v1/users/me/clubs", authId);

        var response = await sut.GetMyClubs(req);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<MyClubListItemDto>>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
        Assert.Equal("Vale FC", payload.Data[0].Name);
    }

    [Fact]
    public async Task UpdateMe_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/users/me", "{}");

        var response = await sut.UpdateMe(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Unauthorized", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateMe_ReturnsBadRequest_WhenBodyDeserializesToNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/users/me", authId, body: "null");

        var response = await sut.UpdateMe(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateMe_ReturnsBadRequest_WhenValidationFails()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"firstName\":\"\",\"lastName\":\"\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateMyProfileCommand, UserProfileDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["FirstName"] = new[] { "First name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/users/me", authId, body);

        var response = await sut.UpdateMe(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateMe_ReturnsNotFound_WhenUserMissing()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"firstName\":\"Jamie\",\"lastName\":\"Coach\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateMyProfileCommand, UserProfileDto>((_, _) =>
            throw new NotFoundException("User", authId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/users/me", authId, body);

        var response = await sut.UpdateMe(req);

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("NOT_FOUND", payload.Error?.Code);
    }

    [Fact]
    public async Task UpdateMe_ReturnsInternalServerError_WhenMediatorThrowsUnexpectedException()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"firstName\":\"Jamie\",\"lastName\":\"Coach\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateMyProfileCommand, UserProfileDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/users/me", authId, body);

        var response = await sut.UpdateMe(req);

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the user profile", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateMe_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"firstName\":\"Jamie\",\"lastName\":\"Coach\"}";
        var expected = new UserProfileDto
        {
            Id = Guid.NewGuid(),
            AuthId = authId,
            FirstName = "Jamie",
            LastName = "Coach",
            Email = "jamie@ourgame.local"
        };

        var mediator = new TestMediator();
        mediator.Register<UpdateMyProfileCommand, UserProfileDto>((command, _) =>
            Task.FromResult(command.AuthId == authId ? expected : new UserProfileDto()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/users/me", authId, body);

        var response = await sut.UpdateMe(req);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<UserProfileDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.AuthId, payload.Data!.AuthId);
        Assert.Equal(expected.Email, payload.Data.Email);
    }

    private static UserFunctions BuildSut(TestMediator mediator)
    {
        return new UserFunctions(mediator, NullLogger<UserFunctions>.Instance);
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
