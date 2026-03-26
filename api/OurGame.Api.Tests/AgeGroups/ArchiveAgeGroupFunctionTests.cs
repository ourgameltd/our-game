using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.AgeGroups;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.AgeGroups.Commands.ArchiveAgeGroup;

namespace OurGame.Api.Tests.AgeGroups;

public class ArchiveAgeGroupFunctionTests
{
    // ── ArchiveAgeGroup ─────────────────────────────────────────────────

    [Fact]
    public async Task ArchiveAgeGroup_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/age-groups/00000000-0000-0000-0000-000000000001/archive", "{}");

        var response = await sut.ArchiveAgeGroup(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ArchiveAgeGroup_ReturnsBadRequest_WhenAgeGroupIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/age-groups/not-a-guid/archive", authId, "{}");

        var response = await sut.ArchiveAgeGroup(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task ArchiveAgeGroup_ReturnsBadRequest_WhenRequestBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/age-groups/{ageGroupId}/archive", authId, "null");

        var response = await sut.ArchiveAgeGroup(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task ArchiveAgeGroup_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<ArchiveAgeGroupCommand>((_, _) =>
            throw new NotFoundException("Age group", ageGroupId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/age-groups/{ageGroupId}/archive", authId, "{\"isArchived\":true}");

        var response = await sut.ArchiveAgeGroup(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task ArchiveAgeGroup_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<ArchiveAgeGroupCommand>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/age-groups/{ageGroupId}/archive", authId, "{\"isArchived\":true}");

        var response = await sut.ArchiveAgeGroup(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating age group archive status", payload.Error?.Message);
    }

    [Fact]
    public async Task ArchiveAgeGroup_ReturnsNoContent_WhenArchiveSucceeds()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<ArchiveAgeGroupCommand>((_, _) => Task.CompletedTask);

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/age-groups/{ageGroupId}/archive", authId, "{\"isArchived\":true}");

        var response = await sut.ArchiveAgeGroup(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static ArchiveAgeGroupFunction BuildSut(TestMediator mediator)
    {
        return new ArchiveAgeGroupFunction(mediator, NullLogger<ArchiveAgeGroupFunction>.Instance);
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
