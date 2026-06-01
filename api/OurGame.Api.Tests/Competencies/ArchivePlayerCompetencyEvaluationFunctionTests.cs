using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Competencies;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Competencies.Commands.ArchivePlayerCompetencyEvaluation;

namespace OurGame.Api.Tests.Competencies;

public class ArchivePlayerCompetencyEvaluationFunctionTests
{
    [Fact]
    public async Task ArchivePlayerCompetencyEvaluation_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PATCH", "https://localhost/v1/players/some-id/competency-evaluations/some-eval-id");

        var response = await sut.ArchivePlayerCompetencyEvaluation(req, "some-id", "some-eval-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task ArchivePlayerCompetencyEvaluation_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PATCH", "https://localhost/v1/players/not-a-guid/competency-evaluations/some-eval-id",
            JsonSerializer.Serialize(new { isArchived = true }));

        var response = await sut.ArchivePlayerCompetencyEvaluation(req, "not-a-guid", "some-eval-id");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ArchivePlayerCompetencyEvaluation_ReturnsBadRequest_WhenEvaluationIdIsNotValidGuid()
    {
        var playerId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PATCH", $"https://localhost/v1/players/{playerId}/competency-evaluations/not-a-guid",
            JsonSerializer.Serialize(new { isArchived = true }));

        var response = await sut.ArchivePlayerCompetencyEvaluation(req, playerId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ArchivePlayerCompetencyEvaluation_ReturnsNotFound_WhenEvaluationDoesNotBelongToPlayer()
    {
        var playerId = Guid.NewGuid();
        var evalId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<ArchivePlayerCompetencyEvaluationCommand, Unit>((_, _) =>
            throw new NotFoundException("PlayerCompetencyEvaluation", evalId.ToString()));

        var sut = BuildSut(mediator);
        var body = JsonSerializer.Serialize(new { isArchived = true });
        var req = CreateAuthedRequest("PATCH", $"https://localhost/v1/players/{playerId}/competency-evaluations/{evalId}", body);

        var response = await sut.ArchivePlayerCompetencyEvaluation(req, playerId.ToString(), evalId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task ArchivePlayerCompetencyEvaluation_ReturnsNoContent_WhenSuccessful()
    {
        var playerId = Guid.NewGuid();
        var evalId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<ArchivePlayerCompetencyEvaluationCommand, Unit>((_, _) =>
            Task.FromResult(Unit.Value));

        var sut = BuildSut(mediator);
        var body = JsonSerializer.Serialize(new { isArchived = true });
        var req = CreateAuthedRequest("PATCH", $"https://localhost/v1/players/{playerId}/competency-evaluations/{evalId}", body);

        var response = await sut.ArchivePlayerCompetencyEvaluation(req, playerId.ToString(), evalId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static PlayerCompetencyFunctions BuildSut(TestMediator mediator)
    {
        return new PlayerCompetencyFunctions(mediator, NullLogger<PlayerCompetencyFunctions>.Instance);
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
