using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch.DTOs;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch.DTOs;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById.DTOs;

namespace OurGame.Api.Tests.Matches;

public class MatchFunctionsTests
{
    // ───────────────────────────────────────────────
    // GetMatchById
    // ───────────────────────────────────────────────

    [Fact]
    public async Task GetMatchById_ReturnsBadRequest_WhenIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/matches/not-a-guid", authId);

        var response = await sut.GetMatchById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid match ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetMatchById_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var matchId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetMatchByIdQuery, MatchDetailDto?>((_, _) =>
            Task.FromResult<MatchDetailDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/matches/{matchId}", authId);

        var response = await sut.GetMatchById(req, matchId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Match not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetMatchById_ReturnsOk_WhenMatchExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var matchId = Guid.NewGuid();
        var expected = new MatchDetailDto
        {
            Id = matchId,
            TeamId = Guid.NewGuid(),
            Opposition = "Rovers FC",
            Status = "completed"
        };

        var mediator = new TestMediator();
        mediator.Register<GetMatchByIdQuery, MatchDetailDto?>((query, _) =>
            Task.FromResult<MatchDetailDto?>(query.MatchId == matchId && query.UserId == authId ? expected : null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/matches/{matchId}", authId);

        var response = await sut.GetMatchById(req, matchId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(matchId, payload.Data!.Id);
        Assert.Equal("Rovers FC", payload.Data.Opposition);
    }

    // ───────────────────────────────────────────────
    // GetMatchReport
    // ───────────────────────────────────────────────

    [Fact]
    public async Task GetMatchReport_ReturnsBadRequest_WhenIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/matches/bad-id/report", authId);

        var response = await sut.GetMatchReport(req, "bad-id");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid match ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetMatchReport_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var matchId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetMatchByIdQuery, MatchDetailDto?>((_, _) =>
            Task.FromResult<MatchDetailDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/matches/{matchId}/report", authId);

        var response = await sut.GetMatchReport(req, matchId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Match not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetMatchReport_ReturnsOk_WhenMatchExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var matchId = Guid.NewGuid();
        var expected = new MatchDetailDto
        {
            Id = matchId,
            TeamId = Guid.NewGuid(),
            Opposition = "City United",
            Status = "completed"
        };

        var mediator = new TestMediator();
        mediator.Register<GetMatchByIdQuery, MatchDetailDto?>((query, _) =>
            Task.FromResult<MatchDetailDto?>(query.MatchId == matchId && query.UserId == authId ? expected : null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/matches/{matchId}/report", authId);

        var response = await sut.GetMatchReport(req, matchId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(matchId, payload.Data!.Id);
        Assert.Equal("City United", payload.Data.Opposition);
    }

    // ───────────────────────────────────────────────
    // CreateMatch
    // ───────────────────────────────────────────────

    [Fact]
    public async Task CreateMatch_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/matches", authId, body: "null");

        var response = await sut.CreateMatch(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateMatch_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"teamId\":\"" + Guid.NewGuid() + "\",\"seasonId\":\"2025\",\"squadSize\":11,\"opposition\":\"Rovers\",\"matchDate\":\"2025-06-01T15:00:00\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateMatchCommand, MatchDetailDto>((_, _) =>
            throw new NotFoundException("Team", Guid.NewGuid()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/matches", authId, body);

        var response = await sut.CreateMatch(req);

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task CreateMatch_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"teamId\":\"" + Guid.NewGuid() + "\",\"seasonId\":\"2025\",\"squadSize\":11,\"opposition\":\"Rovers\",\"matchDate\":\"2025-06-01T15:00:00\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateMatchCommand, MatchDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Opposition"] = new[] { "Opposition is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/matches", authId, body);

        var response = await sut.CreateMatch(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateMatch_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{\"teamId\":\"" + Guid.NewGuid() + "\",\"seasonId\":\"2025\",\"squadSize\":11,\"opposition\":\"Rovers\",\"matchDate\":\"2025-06-01T15:00:00\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateMatchCommand, MatchDetailDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/matches", authId, body);

        var response = await sut.CreateMatch(req);

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the match", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateMatch_ReturnsCreated_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"teamId\":\"" + teamId + "\",\"seasonId\":\"2025\",\"squadSize\":11,\"opposition\":\"Rovers\",\"matchDate\":\"2025-06-01T15:00:00\"}";
        var expected = new MatchDetailDto
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            Opposition = "Rovers",
            Status = "scheduled"
        };

        var mediator = new TestMediator();
        mediator.Register<CreateMatchCommand, MatchDetailDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/matches", authId, body);

        var response = await sut.CreateMatch(req);

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(201, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
        Assert.Equal("Rovers", payload.Data.Opposition);
    }

    // ───────────────────────────────────────────────
    // UpdateMatch
    // ───────────────────────────────────────────────

    [Fact]
    public async Task UpdateMatch_ReturnsBadRequest_WhenIdIsNotValidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/matches/not-a-guid", authId, body: "{}");

        var response = await sut.UpdateMatch(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid match ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateMatch_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var matchId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/matches/{matchId}", authId, body: "null");

        var response = await sut.UpdateMatch(req, matchId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateMatch_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var matchId = Guid.NewGuid();
        var body = "{\"seasonId\":\"2025\",\"squadSize\":11,\"opposition\":\"Rovers\",\"matchDate\":\"2025-06-01T15:00:00\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateMatchCommand, MatchDetailDto>((_, _) =>
            throw new NotFoundException("Match", matchId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/matches/{matchId}", authId, body);

        var response = await sut.UpdateMatch(req, matchId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateMatch_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var matchId = Guid.NewGuid();
        var body = "{\"seasonId\":\"2025\",\"squadSize\":11,\"opposition\":\"\",\"matchDate\":\"2025-06-01T15:00:00\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateMatchCommand, MatchDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Opposition"] = new[] { "Opposition is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/matches/{matchId}", authId, body);

        var response = await sut.UpdateMatch(req, matchId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateMatch_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var matchId = Guid.NewGuid();
        var body = "{\"seasonId\":\"2025\",\"squadSize\":11,\"opposition\":\"Rovers\",\"matchDate\":\"2025-06-01T15:00:00\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateMatchCommand, MatchDetailDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/matches/{matchId}", authId, body);

        var response = await sut.UpdateMatch(req, matchId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the match", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateMatch_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var matchId = Guid.NewGuid();
        var body = "{\"seasonId\":\"2025\",\"squadSize\":11,\"opposition\":\"Rovers Updated\",\"matchDate\":\"2025-06-01T15:00:00\"}";
        var expected = new MatchDetailDto
        {
            Id = matchId,
            TeamId = Guid.NewGuid(),
            Opposition = "Rovers Updated",
            Status = "scheduled"
        };

        var mediator = new TestMediator();
        mediator.Register<UpdateMatchCommand, MatchDetailDto>((command, _) =>
            Task.FromResult(command.MatchId == matchId ? expected : new MatchDetailDto()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/matches/{matchId}", authId, body);

        var response = await sut.UpdateMatch(req, matchId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<MatchDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(matchId, payload.Data!.Id);
        Assert.Equal("Rovers Updated", payload.Data.Opposition);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static MatchFunctions BuildSut(TestMediator mediator)
    {
        return new MatchFunctions(mediator, NullLogger<MatchFunctions>.Instance);
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
