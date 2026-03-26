using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Coaches;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Coaches.Commands.UpdateCoachById;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachById.DTOs;

namespace OurGame.Api.Tests.Coaches;

public class UpdateCoachFunctionTests
{
    // ── UpdateCoach ─────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateCoach_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/coaches/00000000-0000-0000-0000-000000000001", "{}");

        var response = await sut.UpdateCoach(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<CoachDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateCoach_ReturnsBadRequest_WhenCoachIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/coaches/not-a-guid", authId, "{}");

        var response = await sut.UpdateCoach(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<CoachDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid coach ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateCoach_ReturnsBadRequest_WhenRequestBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var coachId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/coaches/{coachId}", authId, "null");

        var response = await sut.UpdateCoach(req, coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<CoachDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateCoach_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var coachId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateCoachCommand, CoachDetailDto>((_, _) =>
            throw new NotFoundException("Coach", coachId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/coaches/{coachId}", authId, "{}");

        var response = await sut.UpdateCoach(req, coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<CoachDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateCoach_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var coachId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateCoachCommand, CoachDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/coaches/{coachId}", authId, "{}");

        var response = await sut.UpdateCoach(req, coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<CoachDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateCoach_ReturnsOk_WhenUpdateSucceeds()
    {
        var authId = Guid.NewGuid().ToString("N");
        var coachId = Guid.NewGuid();
        var expected = new CoachDetailDto { Id = coachId };

        var mediator = new TestMediator();
        mediator.Register<UpdateCoachCommand, CoachDetailDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/coaches/{coachId}", authId, "{}");

        var response = await sut.UpdateCoach(req, coachId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<CoachDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(coachId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static UpdateCoachFunction BuildSut(TestMediator mediator)
    {
        return new UpdateCoachFunction(mediator, NullLogger<UpdateCoachFunction>.Instance);
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
