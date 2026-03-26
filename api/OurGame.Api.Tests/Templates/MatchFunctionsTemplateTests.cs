using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById.DTOs;

namespace OurGame.Api.Tests.Templates;

public class MatchFunctionsTemplateTests
{
    [Fact]
    public async Task GetMatchById_ReturnsUnauthorized_WhenNoAuthenticatedUser()
    {
        var sut = new MatchFunctions(new TestMediator(), NullLogger<MatchFunctions>.Instance);
        var req = new TestHttpRequestData(TestFunctionContextFactory.Create(), "GET", "https://localhost/v1/matches/123");

        var response = await sut.GetMatchById(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateMatch_ReturnsUnauthorizedAndError_WhenNoAuthenticatedUser()
    {
        var body = "{\"teamId\":\"00000000-0000-0000-0000-000000000001\",\"seasonId\":\"2026\",\"squadSize\":11,\"opposition\":\"Rovers\",\"matchDate\":\"2026-03-26T10:00:00Z\"}";
        var sut = new MatchFunctions(new TestMediator(), NullLogger<MatchFunctions>.Instance);
        var req = new TestHttpRequestData(TestFunctionContextFactory.Create(), "POST", "https://localhost/v1/matches", body);

        var response = await sut.CreateMatch(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);

        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.NotNull(payload.Error);
        Assert.Equal("Authentication required", payload.Error!.Message);
        Assert.Equal(401, payload.StatusCode);
    }
}
