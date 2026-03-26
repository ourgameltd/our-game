using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById;
using OurGame.Application.UseCases.TrainingSessions.Queries.GetTrainingSessionById.DTOs;
using OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession;
using OurGame.Application.UseCases.TrainingSessions.Commands.CreateTrainingSession.DTOs;
using OurGame.Application.UseCases.TrainingSessions.Commands.UpdateTrainingSession;
using OurGame.Application.UseCases.TrainingSessions.Commands.UpdateTrainingSession.DTOs;

namespace OurGame.Api.Tests.TrainingSessions;

public class TrainingSessionFunctionsTests
{
    // ── GetTrainingSessionById ──────────────────────────────────────────

    [Fact]
    public async Task GetTrainingSessionById_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/training-sessions/00000000-0000-0000-0000-000000000001");

        var response = await sut.GetTrainingSessionById(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTrainingSessionById_ReturnsBadRequest_WhenIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/training-sessions/not-a-guid", authId);

        var response = await sut.GetTrainingSessionById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid training session ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTrainingSessionById_ReturnsNotFound_WhenSessionDoesNotExist()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sessionId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetTrainingSessionByIdQuery, TrainingSessionDetailDto?>((_, _) =>
            Task.FromResult<TrainingSessionDetailDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/training-sessions/{sessionId}", authId);

        var response = await sut.GetTrainingSessionById(req, sessionId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Training session not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTrainingSessionById_ReturnsOk_WhenSessionExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sessionId = Guid.NewGuid();
        var expected = new TrainingSessionDetailDto { Id = sessionId };

        var mediator = new TestMediator();
        mediator.Register<GetTrainingSessionByIdQuery, TrainingSessionDetailDto?>((_, _) =>
            Task.FromResult<TrainingSessionDetailDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/training-sessions/{sessionId}", authId);

        var response = await sut.GetTrainingSessionById(req, sessionId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(sessionId, payload.Data!.Id);
    }

    [Fact]
    public async Task GetTrainingSessionById_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sessionId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetTrainingSessionByIdQuery, TrainingSessionDetailDto?>((_, _) =>
            throw new NotFoundException("TrainingSession", sessionId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/training-sessions/{sessionId}", authId);

        var response = await sut.GetTrainingSessionById(req, sessionId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task GetTrainingSessionById_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sessionId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetTrainingSessionByIdQuery, TrainingSessionDetailDto?>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Id"] = new[] { "Invalid session." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/training-sessions/{sessionId}", authId);

        var response = await sut.GetTrainingSessionById(req, sessionId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
    }

    [Fact]
    public async Task GetTrainingSessionById_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sessionId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetTrainingSessionByIdQuery, TrainingSessionDetailDto?>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/training-sessions/{sessionId}", authId);

        var response = await sut.GetTrainingSessionById(req, sessionId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while retrieving the training session", payload.Error?.Message);
    }

    // ── CreateTrainingSession ───────────────────────────────────────────

    [Fact]
    public async Task CreateTrainingSession_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/training-sessions");

        var response = await sut.CreateTrainingSession(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateTrainingSession_ReturnsBadRequest_WhenBodyDeserializesToNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/training-sessions", authId, body: "null");

        var response = await sut.CreateTrainingSession(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateTrainingSession_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<CreateTrainingSessionCommand, TrainingSessionDetailDto>((_, _) =>
            throw new NotFoundException("Team", Guid.NewGuid().ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/training-sessions", authId, body);

        var response = await sut.CreateTrainingSession(req);

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task CreateTrainingSession_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<CreateTrainingSessionCommand, TrainingSessionDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Title"] = new[] { "Title is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/training-sessions", authId, body);

        var response = await sut.CreateTrainingSession(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateTrainingSession_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<CreateTrainingSessionCommand, TrainingSessionDetailDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/training-sessions", authId, body);

        var response = await sut.CreateTrainingSession(req);

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the training session", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateTrainingSession_ReturnsCreated_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{}";
        var expected = new TrainingSessionDetailDto { Id = Guid.NewGuid() };

        var mediator = new TestMediator();
        mediator.Register<CreateTrainingSessionCommand, TrainingSessionDetailDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/training-sessions", authId, body);

        var response = await sut.CreateTrainingSession(req);

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
    }

    // ── UpdateTrainingSession ───────────────────────────────────────────

    [Fact]
    public async Task UpdateTrainingSession_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/training-sessions/00000000-0000-0000-0000-000000000001");

        var response = await sut.UpdateTrainingSession(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTrainingSession_ReturnsBadRequest_WhenIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/training-sessions/not-a-guid", authId, body: "{}");

        var response = await sut.UpdateTrainingSession(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid training session ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTrainingSession_ReturnsBadRequest_WhenBodyDeserializesToNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sessionId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/training-sessions/{sessionId}", authId, body: "null");

        var response = await sut.UpdateTrainingSession(req, sessionId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTrainingSession_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sessionId = Guid.NewGuid();
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTrainingSessionCommand, TrainingSessionDetailDto>((_, _) =>
            throw new NotFoundException("TrainingSession", sessionId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/training-sessions/{sessionId}", authId, body);

        var response = await sut.UpdateTrainingSession(req, sessionId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateTrainingSession_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sessionId = Guid.NewGuid();
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTrainingSessionCommand, TrainingSessionDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Title"] = new[] { "Title is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/training-sessions/{sessionId}", authId, body);

        var response = await sut.UpdateTrainingSession(req, sessionId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateTrainingSession_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sessionId = Guid.NewGuid();
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTrainingSessionCommand, TrainingSessionDetailDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/training-sessions/{sessionId}", authId, body);

        var response = await sut.UpdateTrainingSession(req, sessionId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the training session", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTrainingSession_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sessionId = Guid.NewGuid();
        var body = "{}";
        var expected = new TrainingSessionDetailDto { Id = sessionId };

        var mediator = new TestMediator();
        mediator.Register<UpdateTrainingSessionCommand, TrainingSessionDetailDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/training-sessions/{sessionId}", authId, body);

        var response = await sut.UpdateTrainingSession(req, sessionId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TrainingSessionDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static TrainingSessionFunctions BuildSut(TestMediator mediator)
    {
        return new TrainingSessionFunctions(mediator, NullLogger<TrainingSessionFunctions>.Instance);
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
