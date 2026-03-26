using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Tactics;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Tactics.Commands.UpdateTactic;
using OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

namespace OurGame.Api.Tests.Tactics;

public class UpdateTacticFunctionTests
{
    // ── UpdateTactic ────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateTactic_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/tactics/00000000-0000-0000-0000-000000000001", "{}");

        var response = await sut.UpdateTactic(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTactic_ReturnsBadRequest_WhenIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/tactics/not-a-guid", authId, "{}");

        var response = await sut.UpdateTactic(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid tactic ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTactic_ReturnsBadRequest_WhenRequestBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var tacticId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/tactics/{tacticId}", authId, "null");

        var response = await sut.UpdateTactic(req, tacticId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTactic_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var tacticId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateTacticCommand, TacticDetailDto>((_, _) =>
            throw new NotFoundException("Tactic", tacticId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/tactics/{tacticId}", authId, "{}");

        var response = await sut.UpdateTactic(req, tacticId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateTactic_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var tacticId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateTacticCommand, TacticDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/tactics/{tacticId}", authId, "{}");

        var response = await sut.UpdateTactic(req, tacticId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateTactic_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var tacticId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateTacticCommand, TacticDetailDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/tactics/{tacticId}", authId, "{}");

        var response = await sut.UpdateTactic(req, tacticId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the tactic", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTactic_ReturnsOk_WhenUpdateSucceeds()
    {
        var authId = Guid.NewGuid().ToString("N");
        var tacticId = Guid.NewGuid();
        var expected = new TacticDetailDto { Id = tacticId };

        var mediator = new TestMediator();
        mediator.Register<UpdateTacticCommand, TacticDetailDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/tactics/{tacticId}", authId, "{}");

        var response = await sut.UpdateTactic(req, tacticId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TacticDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(tacticId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static UpdateTacticFunction BuildSut(TestMediator mediator)
    {
        return new UpdateTacticFunction(mediator, NullLogger<UpdateTacticFunction>.Instance);
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
