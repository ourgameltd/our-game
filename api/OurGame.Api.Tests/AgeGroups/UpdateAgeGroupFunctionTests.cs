using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.AgeGroups;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.AgeGroups.Commands.UpdateAgeGroup;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById.DTOs;

namespace OurGame.Api.Tests.AgeGroups;

public class UpdateAgeGroupFunctionTests
{
    // ── UpdateAgeGroup ──────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAgeGroup_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/age-groups/00000000-0000-0000-0000-000000000001", "{}");

        var response = await sut.UpdateAgeGroup(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateAgeGroup_ReturnsBadRequest_WhenAgeGroupIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/age-groups/not-a-guid", authId, "{}");

        var response = await sut.UpdateAgeGroup(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateAgeGroup_ReturnsBadRequest_WhenRequestBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/age-groups/{ageGroupId}", authId, "null");

        var response = await sut.UpdateAgeGroup(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateAgeGroup_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateAgeGroupCommand, AgeGroupDetailDto>((_, _) =>
            throw new NotFoundException("Age group", ageGroupId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/age-groups/{ageGroupId}", authId, "{}");

        var response = await sut.UpdateAgeGroup(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateAgeGroup_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateAgeGroupCommand, AgeGroupDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/age-groups/{ageGroupId}", authId, "{}");

        var response = await sut.UpdateAgeGroup(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateAgeGroup_ReturnsOk_WhenUpdateSucceeds()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var expected = new AgeGroupDetailDto { Id = ageGroupId, Name = "Under 10s" };

        var mediator = new TestMediator();
        mediator.Register<UpdateAgeGroupCommand, AgeGroupDetailDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/age-groups/{ageGroupId}", authId, "{}");

        var response = await sut.UpdateAgeGroup(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(ageGroupId, payload.Data!.Id);
        Assert.Equal("Under 10s", payload.Data.Name);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static UpdateAgeGroupFunction BuildSut(TestMediator mediator)
    {
        return new UpdateAgeGroupFunction(mediator, NullLogger<UpdateAgeGroupFunction>.Instance);
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
