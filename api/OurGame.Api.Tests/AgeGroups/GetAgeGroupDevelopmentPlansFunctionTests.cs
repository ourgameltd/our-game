using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.AgeGroups;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupDevelopmentPlans;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupDevelopmentPlans.DTOs;

namespace OurGame.Api.Tests.AgeGroups;

public class GetAgeGroupDevelopmentPlansFunctionTests
{
    // ── GetAgeGroupDevelopmentPlans ──────────────────────────────────────

    [Fact]
    public async Task GetAgeGroupDevelopmentPlans_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/age-groups/00000000-0000-0000-0000-000000000001/development-plans");

        var response = await sut.GetAgeGroupDevelopmentPlans(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAgeGroupDevelopmentPlans_ReturnsBadRequest_WhenAgeGroupIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/age-groups/not-a-guid/development-plans", authId);

        var response = await sut.GetAgeGroupDevelopmentPlans(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<AgeGroupDevelopmentPlanSummaryDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetAgeGroupDevelopmentPlans_ReturnsOk_WhenAgeGroupIdIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var expected = new List<AgeGroupDevelopmentPlanSummaryDto>
        {
            new() { Id = Guid.NewGuid() }
        };

        var mediator = new TestMediator();
        mediator.Register<GetAgeGroupDevelopmentPlansQuery, List<AgeGroupDevelopmentPlanSummaryDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/age-groups/{ageGroupId}/development-plans", authId);

        var response = await sut.GetAgeGroupDevelopmentPlans(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<AgeGroupDevelopmentPlanSummaryDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static GetAgeGroupDevelopmentPlansFunction BuildSut(TestMediator mediator)
    {
        return new GetAgeGroupDevelopmentPlansFunction(mediator, NullLogger<GetAgeGroupDevelopmentPlansFunction>.Instance);
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
