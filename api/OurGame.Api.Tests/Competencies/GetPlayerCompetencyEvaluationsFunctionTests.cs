using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.Competencies;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencyEvaluations;
using OurGame.Application.UseCases.Competencies.Queries.GetPlayerCompetencyEvaluations.DTOs;

namespace OurGame.Api.Tests.Competencies;

public class GetPlayerCompetencyEvaluationsFunctionTests
{
    [Fact]
    public async Task GetPlayerCompetencyEvaluations_ReturnsUnauthorized_WhenUserNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/players/some-id/competency-evaluations");

        var response = await sut.GetPlayerCompetencyEvaluations(req, "some-id");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerCompetencyEvaluationSummaryDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerCompetencyEvaluations_ReturnsBadRequest_WhenPlayerIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/players/not-a-guid/competency-evaluations");

        var response = await sut.GetPlayerCompetencyEvaluations(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerCompetencyEvaluationSummaryDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
    }

    [Fact]
    public async Task GetPlayerCompetencyEvaluations_ReturnsOk_WithEmptyList_WhenNoEvaluationsExist()
    {
        var playerId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetPlayerCompetencyEvaluationsQuery, List<PlayerCompetencyEvaluationSummaryDto>>(
            (_, _) => Task.FromResult(new List<PlayerCompetencyEvaluationSummaryDto>()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/competency-evaluations");

        var response = await sut.GetPlayerCompetencyEvaluations(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerCompetencyEvaluationSummaryDto>>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Empty(payload.Data!);
    }

    [Fact]
    public async Task GetPlayerCompetencyEvaluations_ReturnsOk_WithEvaluations_OrderedNewestFirst()
    {
        var playerId = Guid.NewGuid();
        var newerEvalId = Guid.NewGuid();
        var olderEvalId = Guid.NewGuid();

        var evaluations = new List<PlayerCompetencyEvaluationSummaryDto>
        {
            new() { Id = newerEvalId, CoachName = "Jane Smith", EvaluatedAt = DateTime.UtcNow, IsArchived = false, Levels = [] },
            new() { Id = olderEvalId, CoachName = "John Doe", EvaluatedAt = DateTime.UtcNow.AddDays(-7), IsArchived = false, Levels = [] },
        };

        var mediator = new TestMediator();
        mediator.Register<GetPlayerCompetencyEvaluationsQuery, List<PlayerCompetencyEvaluationSummaryDto>>(
            (_, _) => Task.FromResult(evaluations));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/competency-evaluations");

        var response = await sut.GetPlayerCompetencyEvaluations(req, playerId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerCompetencyEvaluationSummaryDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(2, payload.Data!.Count);
        Assert.Equal(newerEvalId, payload.Data[0].Id);
    }

    [Fact]
    public async Task GetPlayerCompetencyEvaluations_SerializesGoalkeeperCompetencyName()
    {
        var playerId = Guid.NewGuid();
        var competencyId = Guid.NewGuid();
        var evaluations = new List<PlayerCompetencyEvaluationSummaryDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                CoachName = "Jane Smith",
                EvaluatedAt = DateTime.UtcNow,
                IsArchived = false,
                Levels =
                [
                    new EvaluationBandDto
                    {
                        CompetencyId = competencyId,
                        CompetencyName = "Control & Receiving",
                        CompetencyGoalkeeperName = "Handling & Catching",
                        DisplayOrder = 1,
                        Band = OurGame.Persistence.Enums.CompetencyBand.Advanced,
                    }
                ],
            },
        };

        var mediator = new TestMediator();
        mediator.Register<GetPlayerCompetencyEvaluationsQuery, List<PlayerCompetencyEvaluationSummaryDto>>(
            (_, _) => Task.FromResult(evaluations));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/players/{playerId}/competency-evaluations");

        var response = await sut.GetPlayerCompetencyEvaluations(req, playerId.ToString());

        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<PlayerCompetencyEvaluationSummaryDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal("Handling & Catching", payload.Data![0].Levels[0].CompetencyGoalkeeperName);
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
