using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerAbilityEvaluation;
using OurGame.Application.UseCases.Players.Commands.UpdatePlayerAbilityEvaluation.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;

namespace OurGame.Api.Tests.Players;

public class UpdatePlayerAbilityEvaluationFunctionTests
{
    [Fact]
    public async Task UpdatePlayerAbilityEvaluation_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/players/some-id/abilities/evaluations/some-eval");

        var response = await sut.UpdatePlayerAbilityEvaluation(req, "some-id", "some-eval");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task UpdatePlayerAbilityEvaluation_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/players/not-a-guid/abilities/evaluations/some-eval");

        var response = await sut.UpdatePlayerAbilityEvaluation(req, "not-a-guid", Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid player ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdatePlayerAbilityEvaluation_ReturnsBadRequest_WhenEvaluationIdIsNotValidGuid()
    {
        var playerId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}/abilities/evaluations/not-a-guid");

        var response = await sut.UpdatePlayerAbilityEvaluation(req, playerId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid evaluation ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdatePlayerAbilityEvaluation_ReturnsBadRequest_WhenBodyIsNull()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}/abilities/evaluations/{evaluationId}", "null");

        var response = await sut.UpdatePlayerAbilityEvaluation(req, playerId.ToString(), evaluationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdatePlayerAbilityEvaluation_ReturnsForbidden_WhenMediatorThrowsForbiddenException()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new UpdatePlayerAbilityEvaluationRequestDto());

        var mediator = new TestMediator();
        mediator.Register<UpdatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>((_, _) =>
            throw new ForbiddenException("Not authorized to update this evaluation"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}/abilities/evaluations/{evaluationId}", body);

        var response = await sut.UpdatePlayerAbilityEvaluation(req, playerId.ToString(), evaluationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Forbidden, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(403, payload.StatusCode);
    }

    [Fact]
    public async Task UpdatePlayerAbilityEvaluation_ReturnsNotFound_WhenMediatorThrowsNotFoundException()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new UpdatePlayerAbilityEvaluationRequestDto());

        var mediator = new TestMediator();
        mediator.Register<UpdatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>((_, _) =>
            throw new NotFoundException("Evaluation not found"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}/abilities/evaluations/{evaluationId}", body);

        var response = await sut.UpdatePlayerAbilityEvaluation(req, playerId.ToString(), evaluationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdatePlayerAbilityEvaluation_ReturnsBadRequest_WhenMediatorThrowsValidationException()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new UpdatePlayerAbilityEvaluationRequestDto());

        var mediator = new TestMediator();
        mediator.Register<UpdatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Pace"] = new[] { "Pace rating must be between 1 and 99" }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}/abilities/evaluations/{evaluationId}", body);

        var response = await sut.UpdatePlayerAbilityEvaluation(req, playerId.ToString(), evaluationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdatePlayerAbilityEvaluation_ReturnsOk_WhenRequestIsValid()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new UpdatePlayerAbilityEvaluationRequestDto());
        var expected = new PlayerAbilityEvaluationDto { Id = evaluationId };

        var mediator = new TestMediator();
        mediator.Register<UpdatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}/abilities/evaluations/{evaluationId}", body);

        var response = await sut.UpdatePlayerAbilityEvaluation(req, playerId.ToString(), evaluationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(evaluationId, payload.Data!.Id);
    }

    [Fact]
    public async Task UpdatePlayerAbilityEvaluation_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new UpdatePlayerAbilityEvaluationRequestDto());

        var mediator = new TestMediator();
        mediator.Register<UpdatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>((_, _) =>
            throw new Exception("Something went wrong"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/players/{playerId}/abilities/evaluations/{evaluationId}", body);

        var response = await sut.UpdatePlayerAbilityEvaluation(req, playerId.ToString(), evaluationId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the evaluation", payload.Error?.Message);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static UpdatePlayerAbilityEvaluationFunction BuildSut(TestMediator mediator)
    {
        return new UpdatePlayerAbilityEvaluationFunction(mediator, NullLogger<UpdatePlayerAbilityEvaluationFunction>.Instance);
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
