using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Drills;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Drills.Commands.CreateDrill;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById.DTOs;

namespace OurGame.Api.Tests.Drills;

public class CreateDrillFunctionTests
{
    // ── CreateDrill ─────────────────────────────────────────────────────

    [Fact]
    public async Task CreateDrill_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/drills", "{}");

        var response = await sut.CreateDrill(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateDrill_ReturnsBadRequest_WhenRequestBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/drills", authId, "null");

        var response = await sut.CreateDrill(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateDrill_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");

        var mediator = new TestMediator();
        mediator.Register<CreateDrillCommand, DrillDetailDto>((_, _) =>
            throw new NotFoundException("Drill scope", Guid.NewGuid()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/drills", authId, "{}");

        var response = await sut.CreateDrill(req);

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task CreateDrill_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");

        var mediator = new TestMediator();
        mediator.Register<CreateDrillCommand, DrillDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/drills", authId, "{}");

        var response = await sut.CreateDrill(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateDrill_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");

        var mediator = new TestMediator();
        mediator.Register<CreateDrillCommand, DrillDetailDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/drills", authId, "{}");

        var response = await sut.CreateDrill(req);

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the drill", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateDrill_ReturnsCreated_WhenDrillCreatedSuccessfully()
    {
        var authId = Guid.NewGuid().ToString("N");
        var drillId = Guid.NewGuid();
        var expected = new DrillDetailDto { Id = drillId };

        var mediator = new TestMediator();
        mediator.Register<CreateDrillCommand, DrillDetailDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/drills", authId, "{}");

        var response = await sut.CreateDrill(req);

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(201, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(drillId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static CreateDrillFunction BuildSut(TestMediator mediator)
    {
        return new CreateDrillFunction(mediator, NullLogger<CreateDrillFunction>.Instance);
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
