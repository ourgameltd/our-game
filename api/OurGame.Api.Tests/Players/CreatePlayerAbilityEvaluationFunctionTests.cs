using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Players;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Players.Commands.CreatePlayerAbilityEvaluation;
using OurGame.Application.UseCases.Players.Commands.CreatePlayerAbilityEvaluation.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAbilities.DTOs;

namespace OurGame.Api.Tests.Players;

public class CreatePlayerAbilityEvaluationFunctionTests
{
    [Fact]
    public async Task CreatePlayerAbilityEvaluation_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/players/some-id/abilities/evaluations");

        var response = await sut.CreatePlayerAbilityEvaluation(req, "some-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task CreatePlayerAbilityEvaluation_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/players/not-a-guid/abilities/evaluations");

        var response = await sut.CreatePlayerAbilityEvaluation(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid player ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task CreatePlayerAbilityEvaluation_ReturnsBadRequest_WhenBodyIsNull()
    {
        var playerId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/players/{playerId}/abilities/evaluations", "null");

        var response = await sut.CreatePlayerAbilityEvaluation(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreatePlayerAbilityEvaluation_ReturnsForbidden_WhenMediatorThrowsForbiddenException()
    {
        var playerId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new CreatePlayerAbilityEvaluationRequestDto());

        var mediator = new TestMediator();
        mediator.Register<CreatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>((_, _) =>
            throw new ForbiddenException("Not authorized to create evaluations"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/players/{playerId}/abilities/evaluations", body);

        var response = await sut.CreatePlayerAbilityEvaluation(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Forbidden, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(403, payload.StatusCode);
    }

    [Fact]
    public async Task CreatePlayerAbilityEvaluation_ReturnsNotFound_WhenMediatorThrowsNotFoundException()
    {
        var playerId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new CreatePlayerAbilityEvaluationRequestDto());

        var mediator = new TestMediator();
        mediator.Register<CreatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>((_, _) =>
            throw new NotFoundException("Player not found"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/players/{playerId}/abilities/evaluations", body);

        var response = await sut.CreatePlayerAbilityEvaluation(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task CreatePlayerAbilityEvaluation_ReturnsBadRequest_WhenMediatorThrowsValidationException()
    {
        var playerId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new CreatePlayerAbilityEvaluationRequestDto());

        var mediator = new TestMediator();
        mediator.Register<CreatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Pace"] = new[] { "Pace rating is required" }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/players/{playerId}/abilities/evaluations", body);

        var response = await sut.CreatePlayerAbilityEvaluation(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreatePlayerAbilityEvaluation_ReturnsInternalServerError_WhenMediatorThrowsUnexpectedException()
    {
        var playerId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new CreatePlayerAbilityEvaluationRequestDto());

        var mediator = new TestMediator();
        mediator.Register<CreatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/players/{playerId}/abilities/evaluations", body);

        var response = await sut.CreatePlayerAbilityEvaluation(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the evaluation", payload.Error?.Message);
    }

    [Fact]
    public async Task CreatePlayerAbilityEvaluation_ReturnsCreated_WhenRequestIsValid()
    {
        var playerId = Guid.NewGuid();
        var evaluationId = Guid.NewGuid();
        var body = JsonSerializer.Serialize(new CreatePlayerAbilityEvaluationRequestDto());
        var expected = new PlayerAbilityEvaluationDto { Id = evaluationId };

        var mediator = new TestMediator();
        mediator.Register<CreatePlayerAbilityEvaluationCommand, PlayerAbilityEvaluationDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/players/{playerId}/abilities/evaluations", body);

        var response = await sut.CreatePlayerAbilityEvaluation(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PlayerAbilityEvaluationDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(201, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(evaluationId, payload.Data!.Id);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static CreatePlayerAbilityEvaluationFunction BuildSut(TestMediator mediator)
    {
        return new CreatePlayerAbilityEvaluationFunction(mediator, NullLogger<CreatePlayerAbilityEvaluationFunction>.Instance);
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
