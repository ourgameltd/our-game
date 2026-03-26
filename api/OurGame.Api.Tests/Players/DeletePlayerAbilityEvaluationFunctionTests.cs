using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.DeletePlayerAbilityEvaluation;

namespace OurGame.Api.Tests.Players;

public class DeletePlayerAbilityEvaluationFunctionTests
{
    [Fact]
    public async Task DeletePlayerAbilityEvaluation_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("DELETE", "https://localhost/v1/players/some-id/abilities/evaluations/some-eval");

        var response = await sut.DeletePlayerAbilityEvaluation(req, "some-id", "some-eval");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task DeletePlayerAbilityEvaluation_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", "https://localhost/v1/players/not-a-guid/abilities/evaluations/some-eval");

        var response = await sut.DeletePlayerAbilityEvaluation(req, "not-a-guid", Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid player ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task DeletePlayerAbilityEvaluation_ReturnsBadRequest_WhenEvaluationIdIsNotValidGuid()
    {
        var playerId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/players/{playerId}/abilities/evaluations/not-a-guid");

        var response = await sut.DeletePlayerAbilityEvaluation(req, playerId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid evaluation ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task DeletePlayerAbilityEvaluation_ReturnsForbidden_WhenMediatorThrowsForbiddenException()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeletePlayerAbilityEvaluationCommand>((_, _) =>
            throw new ForbiddenException("Not authorized to delete this evaluation"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/players/{playerId}/abilities/evaluations/{evaluationId}");

        var response = await sut.DeletePlayerAbilityEvaluation(req, playerId.ToString(), evaluationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Forbidden, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(403, payload.StatusCode);
    }

    [Fact]
    public async Task DeletePlayerAbilityEvaluation_ReturnsNotFound_WhenMediatorThrowsNotFoundException()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeletePlayerAbilityEvaluationCommand>((_, _) =>
            throw new NotFoundException("Evaluation not found"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/players/{playerId}/abilities/evaluations/{evaluationId}");

        var response = await sut.DeletePlayerAbilityEvaluation(req, playerId.ToString(), evaluationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task DeletePlayerAbilityEvaluation_ReturnsInternalServerError_WhenMediatorThrowsUnexpectedException()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeletePlayerAbilityEvaluationCommand>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/players/{playerId}/abilities/evaluations/{evaluationId}");

        var response = await sut.DeletePlayerAbilityEvaluation(req, playerId.ToString(), evaluationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while deleting the evaluation", payload.Error?.Message);
    }

    [Fact]
    public async Task DeletePlayerAbilityEvaluation_ReturnsNoContent_WhenSuccessful()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeletePlayerAbilityEvaluationCommand>((_, _) => Task.CompletedTask);

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/players/{playerId}/abilities/evaluations/{evaluationId}");

        var response = await sut.DeletePlayerAbilityEvaluation(req, playerId.ToString(), evaluationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static DeletePlayerAbilityEvaluationFunction BuildSut(TestMediator mediator)
    {
        return new DeletePlayerAbilityEvaluationFunction(mediator, NullLogger<DeletePlayerAbilityEvaluationFunction>.Instance);
    }

    private static TestHttpRequestData CreateRequest(string method, string url, string? body = null)
    {
        return new TestHttpRequestData(TestFunctionContextFactory.Create(), method, url, body);
    }

    private static TestHttpRequestData CreateAuthedRequest(string method, string url, string? body = null)
    {
        var authId = Guid.NewGuid().ToString("N");
        var req = CreateRequest(method, url, body);
        req.AddClientPrincipalHeader(authId);
        return req;
    }
}
