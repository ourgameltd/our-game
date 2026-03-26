using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Drills;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Drills.Commands.UpdateDrill;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;

namespace OurGame.Api.Tests.Drills;

public class UpdateDrillFunctionTests
{
    // ── UpdateDrill ─────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateDrill_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/drills/00000000-0000-0000-0000-000000000001", "{}");

        var response = await sut.UpdateDrill(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDrill_ReturnsBadRequest_WhenDrillIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/drills/not-a-guid", authId, "{}");

        var response = await sut.UpdateDrill(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid drill ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDrill_ReturnsBadRequest_WhenRequestBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var drillId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drills/{drillId}", authId, "null");

        var response = await sut.UpdateDrill(req, drillId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDrill_ReturnsForbidden_WhenUnauthorizedAccessExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var drillId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateDrillCommand, DrillDetailDto>((_, _) =>
            throw new UnauthorizedAccessException("Only the creating coach can update this drill"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drills/{drillId}", authId, "{}");

        var response = await sut.UpdateDrill(req, drillId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Forbidden, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(403, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateDrill_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var drillId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateDrillCommand, DrillDetailDto>((_, _) =>
            throw new NotFoundException("Drill", drillId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drills/{drillId}", authId, "{}");

        var response = await sut.UpdateDrill(req, drillId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateDrill_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var drillId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateDrillCommand, DrillDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drills/{drillId}", authId, "{}");

        var response = await sut.UpdateDrill(req, drillId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateDrill_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var drillId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateDrillCommand, DrillDetailDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drills/{drillId}", authId, "{}");

        var response = await sut.UpdateDrill(req, drillId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the drill", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDrill_ReturnsOk_WhenUpdateSucceeds()
    {
        var authId = Guid.NewGuid().ToString("N");
        var drillId = Guid.NewGuid();
        var expected = new DrillDetailDto { Id = drillId };

        var mediator = new TestMediator();
        mediator.Register<UpdateDrillCommand, DrillDetailDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drills/{drillId}", authId, "{}");

        var response = await sut.UpdateDrill(req, drillId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(drillId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static UpdateDrillFunction BuildSut(TestMediator mediator)
    {
        return new UpdateDrillFunction(mediator, NullLogger<UpdateDrillFunction>.Instance);
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
