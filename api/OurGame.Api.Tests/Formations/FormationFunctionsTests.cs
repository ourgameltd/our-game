using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Formations.Queries.GetSystemFormations;
using OurGame.Application.UseCases.Formations.Queries.GetSystemFormations.DTOs;

namespace OurGame.Api.Tests.Formations;

public class FormationFunctionsTests
{
    // ── GetSystemFormations ─────────────────────────────────────────────

    [Fact]
    public async Task GetSystemFormations_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/formations/system");

        var response = await sut.GetSystemFormations(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<SystemFormationDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task GetSystemFormations_ReturnsOk_WhenAuthenticated()
    {
        var authId = Guid.NewGuid().ToString("N");
        var expected = new List<SystemFormationDto>
        {
            new() { Id = Guid.NewGuid(), Name = "4-4-2" },
            new() { Id = Guid.NewGuid(), Name = "4-3-3" }
        };

        var mediator = new TestMediator();
        mediator.Register<GetSystemFormationsQuery, List<SystemFormationDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", "https://localhost/v1/formations/system", authId);

        var response = await sut.GetSystemFormations(req);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<SystemFormationDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(2, payload.Data!.Count);
    }

    [Fact]
    public async Task GetSystemFormations_ReturnsOk_WhenNoFormationsExist()
    {
        var authId = Guid.NewGuid().ToString("N");

        var mediator = new TestMediator();
        mediator.Register<GetSystemFormationsQuery, List<SystemFormationDto>>((_, _) =>
            Task.FromResult(new List<SystemFormationDto>()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", "https://localhost/v1/formations/system", authId);

        var response = await sut.GetSystemFormations(req);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<SystemFormationDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Empty(payload.Data!);
    }

    [Fact]
    public async Task GetSystemFormations_ReturnsFourASidePositionsInPayload()
    {
        var authId = Guid.NewGuid().ToString("N");
        var expected = new List<SystemFormationDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "1-2-1",
                System = "1-2-1",
                Positions = new List<SystemFormationPositionDto>
                {
                    new() { PositionIndex = 0, Position = "CB", X = 50.0, Y = 18.0 },
                    new() { PositionIndex = 1, Position = "CM", X = 35.0, Y = 50.0 },
                    new() { PositionIndex = 2, Position = "CM", X = 65.0, Y = 50.0 },
                    new() { PositionIndex = 3, Position = "ST", X = 50.0, Y = 82.0 }
                }
            }
        };

        var mediator = new TestMediator();
        mediator.Register<GetSystemFormationsQuery, List<SystemFormationDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", "https://localhost/v1/formations/system", authId);

        var response = await sut.GetSystemFormations(req);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<SystemFormationDto>>(response);
        var fourASide = Assert.Single(payload.Data!);
        Assert.Equal(new[] { "CB", "CM", "CM", "ST" }, fourASide.Positions.Select(position => position.Position));
        Assert.DoesNotContain(fourASide.Positions, position => position.Position == "GK");
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static FormationFunctions BuildSut(TestMediator mediator)
    {
        return new FormationFunctions(mediator, NullLogger<FormationFunctions>.Instance);
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
