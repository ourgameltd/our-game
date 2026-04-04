using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Users.Queries.GetUserRoles;

namespace OurGame.Api.Tests.Users;

public class GetRolesFunctionsTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    [Fact]
    public async Task GetRoles_ReturnsEmptyRoles_WhenNoClientPrincipal()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/GetRoles");

        var response = await sut.GetRoles(req);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await ReadRolesResponse(response);
        Assert.Empty(payload.Roles);
    }

    [Fact]
    public async Task GetRoles_ReturnsAdminRole_WhenUserIsAdmin()
    {
        var authId = Guid.NewGuid().ToString("N");
        var mediator = new TestMediator();
        mediator.Register<GetUserRolesQuery, List<string>>(
            (_, _) => Task.FromResult(new List<string> { "admin" }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/GetRoles", authId);

        var response = await sut.GetRoles(req);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await ReadRolesResponse(response);
        Assert.Single(payload.Roles);
        Assert.Contains("admin", payload.Roles);
    }

    [Fact]
    public async Task GetRoles_ReturnsEmptyRoles_WhenUserIsNotAdmin()
    {
        var authId = Guid.NewGuid().ToString("N");
        var mediator = new TestMediator();
        mediator.Register<GetUserRolesQuery, List<string>>(
            (_, _) => Task.FromResult(new List<string>()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/GetRoles", authId);

        var response = await sut.GetRoles(req);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await ReadRolesResponse(response);
        Assert.Empty(payload.Roles);
    }

    [Fact]
    public async Task GetRoles_ReturnsEmptyRoles_WhenMediatorThrows()
    {
        var authId = Guid.NewGuid().ToString("N");
        var mediator = new TestMediator();
        mediator.Register<GetUserRolesQuery, List<string>>(
            (_, _) => throw new Exception("Database error"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/GetRoles", authId);

        var response = await sut.GetRoles(req);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await ReadRolesResponse(response);
        Assert.Empty(payload.Roles);
    }

    // --- Helpers ---

    private static GetRolesFunctions BuildSut(TestMediator mediator)
        => new(mediator, NullLogger<GetRolesFunctions>.Instance);

    private static TestHttpRequestData CreateRequest(string method, string url)
        => new(TestFunctionContextFactory.Create(), method, url);

    private static TestHttpRequestData CreateAuthedRequest(string method, string url, string authId)
    {
        var req = CreateRequest(method, url);
        req.AddClientPrincipalHeader(authId);
        return req;
    }

    private static async Task<RolesResponse> ReadRolesResponse(Microsoft.Azure.Functions.Worker.Http.HttpResponseData response)
    {
        response.Body.Seek(0, SeekOrigin.Begin);
        var payload = await JsonSerializer.DeserializeAsync<RolesResponse>(response.Body, JsonOptions);
        Assert.NotNull(payload);
        return payload!;
    }

    private sealed class RolesResponse
    {
        public List<string> Roles { get; set; } = new();
    }
}
