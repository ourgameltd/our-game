using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Clubs.Commands.CreateClubKit;
using OurGame.Application.UseCases.Clubs.Commands.CreateClubKit.DTOs;
using OurGame.Application.UseCases.Clubs.Commands.DeleteClubKit;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubKit;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubKit.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetClubStatistics;
using OurGame.Application.UseCases.Clubs.Queries.GetClubStatistics.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetDevelopmentPlansByClubId;
using OurGame.Application.UseCases.Clubs.Queries.GetDevelopmentPlansByClubId.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId;
using OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetMatchesByClubId;
using OurGame.Application.UseCases.Clubs.Queries.GetMatchesByClubId.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetReportCardsByClubId;
using OurGame.Application.UseCases.Clubs.Queries.GetReportCardsByClubId.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetTrainingSessionsByClubId;
using OurGame.Application.UseCases.Clubs.Queries.GetTrainingSessionsByClubId.DTOs;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId.DTOs;
using OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId;
using OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByClubId;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByClubId.DTOs;

namespace OurGame.Api.Tests.Clubs;

public class ClubFunctionsTests
{
    // ── GetClubById ──────────────────────────────────────────────────

    [Fact]
    public async Task GetClubById_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/not-a-guid");

        var response = await sut.GetClubById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubById_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var clubId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetClubByIdQuery, ClubDetailDto?>((_, _) => Task.FromResult<ClubDetailDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}");

        var response = await sut.GetClubById(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Club not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubById_ReturnsOk_WhenClubExists()
    {
        var clubId = Guid.NewGuid();
        var expected = new ClubDetailDto { Id = clubId, Name = "Vale FC" };

        var mediator = new TestMediator();
        mediator.Register<GetClubByIdQuery, ClubDetailDto?>((_, _) => Task.FromResult<ClubDetailDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}");

        var response = await sut.GetClubById(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(clubId, payload.Data!.Id);
    }

    // ── GetClubStatistics ────────────────────────────────────────────

    [Fact]
    public async Task GetClubStatistics_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/bad/statistics");

        var response = await sut.GetClubStatistics(req, "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubStatisticsDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubStatistics_ReturnsOk_WhenClubIdIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new ClubStatisticsDto();

        var mediator = new TestMediator();
        mediator.Register<GetClubStatisticsQuery, ClubStatisticsDto>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/statistics");

        var response = await sut.GetClubStatistics(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubStatisticsDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetClubPlayers ───────────────────────────────────────────────

    [Fact]
    public async Task GetClubPlayers_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/bad/players");

        var response = await sut.GetClubPlayers(req, "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubPlayerDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubPlayers_ReturnsOk_WhenClubIdIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new List<ClubPlayerDto> { new() { Id = Guid.NewGuid(), FirstName = "Alex" } };

        var mediator = new TestMediator();
        mediator.Register<GetPlayersByClubIdQuery, List<ClubPlayerDto>>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/players");

        var response = await sut.GetClubPlayers(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubPlayerDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
    }

    // ── GetClubTeams ─────────────────────────────────────────────────

    [Fact]
    public async Task GetClubTeams_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/bad/teams");

        var response = await sut.GetClubTeams(req, "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubTeamDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubTeams_ReturnsOk_WhenClubIdIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new List<ClubTeamDto> { new() { Id = Guid.NewGuid(), Name = "Reds" } };

        var mediator = new TestMediator();
        mediator.Register<GetTeamsByClubIdQuery, List<ClubTeamDto>>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/teams");

        var response = await sut.GetClubTeams(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubTeamDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
    }

    // ── GetClubCoaches ───────────────────────────────────────────────

    [Fact]
    public async Task GetClubCoaches_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/bad/coaches");

        var response = await sut.GetClubCoaches(req, "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubCoachDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubCoaches_ReturnsOk_WhenClubIdIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new List<ClubCoachDto> { new() { Id = Guid.NewGuid(), FirstName = "Jamie" } };

        var mediator = new TestMediator();
        mediator.Register<GetCoachesByClubIdQuery, List<ClubCoachDto>>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/coaches");

        var response = await sut.GetClubCoaches(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubCoachDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
    }

    // ── GetClubTrainingSessions ──────────────────────────────────────

    [Fact]
    public async Task GetClubTrainingSessions_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/bad/training-sessions");

        var response = await sut.GetClubTrainingSessions(req, "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubTrainingSessionsDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubTrainingSessions_ReturnsOk_WhenClubIdIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new ClubTrainingSessionsDto();

        var mediator = new TestMediator();
        mediator.Register<GetTrainingSessionsByClubIdQuery, ClubTrainingSessionsDto>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/training-sessions");

        var response = await sut.GetClubTrainingSessions(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubTrainingSessionsDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetClubMatches ───────────────────────────────────────────────

    [Fact]
    public async Task GetClubMatches_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/bad/matches");

        var response = await sut.GetClubMatches(req, "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubMatchesDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubMatches_ReturnsOk_WhenClubIdIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new ClubMatchesDto();

        var mediator = new TestMediator();
        mediator.Register<GetMatchesByClubIdQuery, ClubMatchesDto>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/matches");

        var response = await sut.GetClubMatches(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubMatchesDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetClubKits ──────────────────────────────────────────────────

    [Fact]
    public async Task GetClubKits_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/bad/kits");

        var response = await sut.GetClubKits(req, "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubKitDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubKits_ReturnsOk_WhenClubIdIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new List<ClubKitDto> { new() { Id = Guid.NewGuid(), Name = "Home Kit" } };

        var mediator = new TestMediator();
        mediator.Register<GetKitsByClubIdQuery, List<ClubKitDto>>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/kits");

        var response = await sut.GetClubKits(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubKitDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
    }

    // ── GetClubReportCards ───────────────────────────────────────────

    [Fact]
    public async Task GetClubReportCards_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/bad/report-cards");

        var response = await sut.GetClubReportCards(req, "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubReportCardDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubReportCards_ReturnsOk_WhenClubIdIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new List<ClubReportCardDto> { new() { Id = Guid.NewGuid() } };

        var mediator = new TestMediator();
        mediator.Register<GetReportCardsByClubIdQuery, List<ClubReportCardDto>>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/report-cards");

        var response = await sut.GetClubReportCards(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubReportCardDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
    }

    // ── GetClubDevelopmentPlans ──────────────────────────────────────

    [Fact]
    public async Task GetClubDevelopmentPlans_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/bad/development-plans");

        var response = await sut.GetClubDevelopmentPlans(req, "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubDevelopmentPlanDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubDevelopmentPlans_ReturnsOk_WhenClubIdIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new List<ClubDevelopmentPlanDto> { new() { Id = Guid.NewGuid() } };

        var mediator = new TestMediator();
        mediator.Register<GetDevelopmentPlansByClubIdQuery, List<ClubDevelopmentPlanDto>>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/development-plans");

        var response = await sut.GetClubDevelopmentPlans(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubDevelopmentPlanDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
    }

    // ── CreateClubKit ────────────────────────────────────────────────

    [Fact]
    public async Task CreateClubKit_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/clubs/bad/kits", body: "{}");

        var response = await sut.CreateClubKit(req, "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateClubKit_ReturnsBadRequest_WhenBodyIsNull()
    {
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/kits", body: "null");

        var response = await sut.CreateClubKit(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateClubKit_ReturnsNotFound_WhenMediatorThrowsNotFoundException()
    {
        var clubId = Guid.NewGuid();
        var body = "{\"type\":\"Home\",\"name\":\"Home Kit\",\"shirtColor\":\"#FF0000\",\"shortsColor\":\"#FFFFFF\",\"socksColor\":\"#FF0000\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateClubKitCommand, ClubKitDto>((_, _) =>
            throw new NotFoundException("Club", clubId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/kits", body: body);

        var response = await sut.CreateClubKit(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task CreateClubKit_ReturnsBadRequest_WhenMediatorThrowsValidationException()
    {
        var clubId = Guid.NewGuid();
        var body = "{\"type\":\"Home\",\"name\":\"\",\"shirtColor\":\"#FF0000\",\"shortsColor\":\"#FFFFFF\",\"socksColor\":\"#FF0000\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateClubKitCommand, ClubKitDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required" }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/kits", body: body);

        var response = await sut.CreateClubKit(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateClubKit_ReturnsInternalServerError_WhenMediatorThrowsUnexpectedException()
    {
        var clubId = Guid.NewGuid();
        var body = "{\"type\":\"Home\",\"name\":\"Home Kit\",\"shirtColor\":\"#FF0000\",\"shortsColor\":\"#FFFFFF\",\"socksColor\":\"#FF0000\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateClubKitCommand, ClubKitDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/kits", body: body);

        var response = await sut.CreateClubKit(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the club kit", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateClubKit_ReturnsCreated_WhenRequestIsValid()
    {
        var clubId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var body = "{\"type\":\"Home\",\"name\":\"Home Kit\",\"shirtColor\":\"#FF0000\",\"shortsColor\":\"#FFFFFF\",\"socksColor\":\"#FF0000\"}";
        var expected = new ClubKitDto
        {
            Id = kitId,
            Name = "Home Kit",
            Type = "Home",
            ShirtColor = "#FF0000",
            ShortsColor = "#FFFFFF",
            SocksColor = "#FF0000",
            IsActive = true
        };

        var mediator = new TestMediator();
        mediator.Register<CreateClubKitCommand, ClubKitDto>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/kits", body: body);

        var response = await sut.CreateClubKit(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal(kitId, payload.Data!.Id);
        Assert.Equal("Home Kit", payload.Data.Name);
    }

    // ── UpdateClubKit ────────────────────────────────────────────────

    [Fact]
    public async Task UpdateClubKit_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var kitId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/bad/kits/{kitId}", body: "{}");

        var response = await sut.UpdateClubKit(req, "bad", kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateClubKit_ReturnsBadRequest_WhenKitIdIsNotValidGuid()
    {
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/kits/bad", body: "{}");

        var response = await sut.UpdateClubKit(req, clubId.ToString(), "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid kit ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateClubKit_ReturnsBadRequest_WhenBodyIsNull()
    {
        var clubId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/kits/{kitId}", body: "null");

        var response = await sut.UpdateClubKit(req, clubId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateClubKit_ReturnsNotFound_WhenMediatorThrowsNotFoundException()
    {
        var clubId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var body = "{\"type\":\"Home\",\"name\":\"Home Kit\",\"shirtColor\":\"#FF0000\",\"shortsColor\":\"#FFFFFF\",\"socksColor\":\"#FF0000\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateClubKitCommand, ClubKitDto>((_, _) =>
            throw new NotFoundException("Kit", kitId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/kits/{kitId}", body: body);

        var response = await sut.UpdateClubKit(req, clubId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateClubKit_ReturnsBadRequest_WhenMediatorThrowsValidationException()
    {
        var clubId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var body = "{\"type\":\"Home\",\"name\":\"\",\"shirtColor\":\"#FF0000\",\"shortsColor\":\"#FFFFFF\",\"socksColor\":\"#FF0000\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateClubKitCommand, ClubKitDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required" }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/kits/{kitId}", body: body);

        var response = await sut.UpdateClubKit(req, clubId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateClubKit_ReturnsInternalServerError_WhenMediatorThrowsUnexpectedException()
    {
        var clubId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var body = "{\"type\":\"Home\",\"name\":\"Home Kit\",\"shirtColor\":\"#FF0000\",\"shortsColor\":\"#FFFFFF\",\"socksColor\":\"#FF0000\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateClubKitCommand, ClubKitDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/kits/{kitId}", body: body);

        var response = await sut.UpdateClubKit(req, clubId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the club kit", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateClubKit_ReturnsOk_WhenRequestIsValid()
    {
        var clubId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var body = "{\"type\":\"Home\",\"name\":\"Home Kit Updated\",\"shirtColor\":\"#FF0000\",\"shortsColor\":\"#FFFFFF\",\"socksColor\":\"#FF0000\"}";
        var expected = new ClubKitDto
        {
            Id = kitId,
            Name = "Home Kit Updated",
            Type = "Home",
            ShirtColor = "#FF0000",
            ShortsColor = "#FFFFFF",
            SocksColor = "#FF0000",
            IsActive = true
        };

        var mediator = new TestMediator();
        mediator.Register<UpdateClubKitCommand, ClubKitDto>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/kits/{kitId}", body: body);

        var response = await sut.UpdateClubKit(req, clubId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubKitDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(kitId, payload.Data!.Id);
        Assert.Equal("Home Kit Updated", payload.Data.Name);
    }

    // ── DeleteClubKit ────────────────────────────────────────────────

    [Fact]
    public async Task DeleteClubKit_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var kitId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/clubs/bad/kits/{kitId}");

        var response = await sut.DeleteClubKit(req, "bad", kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task DeleteClubKit_ReturnsBadRequest_WhenKitIdIsNotValidGuid()
    {
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/clubs/{clubId}/kits/bad");

        var response = await sut.DeleteClubKit(req, clubId.ToString(), "bad");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid kit ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task DeleteClubKit_ReturnsNotFound_WhenMediatorThrowsNotFoundException()
    {
        var clubId = Guid.NewGuid();
        var kitId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeleteClubKitCommand>((_, _) =>
            throw new NotFoundException("Kit", kitId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/clubs/{clubId}/kits/{kitId}");

        var response = await sut.DeleteClubKit(req, clubId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task DeleteClubKit_ReturnsInternalServerError_WhenMediatorThrowsUnexpectedException()
    {
        var clubId = Guid.NewGuid();
        var kitId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeleteClubKitCommand>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/clubs/{clubId}/kits/{kitId}");

        var response = await sut.DeleteClubKit(req, clubId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while deleting the club kit", payload.Error?.Message);
    }

    [Fact]
    public async Task DeleteClubKit_ReturnsNoContent_WhenDeleteSucceeds()
    {
        var clubId = Guid.NewGuid();
        var kitId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeleteClubKitCommand>((_, _) => Task.CompletedTask);

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/clubs/{clubId}/kits/{kitId}");

        var response = await sut.DeleteClubKit(req, clubId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static ClubFunctions BuildSut(TestMediator mediator)
    {
        return new ClubFunctions(mediator, NullLogger<ClubFunctions>.Instance);
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

    // ── Additional coverage: query param combinations ───────────────

    [Fact]
    public async Task GetClubTrainingSessions_ReturnsOk_WithAgeGroupAndTeamQueryParams()
    {
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var expected = new ClubTrainingSessionsDto();

        var mediator = new TestMediator();
        mediator.Register<GetTrainingSessionsByClubIdQuery, ClubTrainingSessionsDto>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/training-sessions?ageGroupId={ageGroupId}&teamId={teamId}&status=completed");

        var response = await sut.GetClubTrainingSessions(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetClubMatches_ReturnsOk_WithAgeGroupAndTeamQueryParams()
    {
        var clubId = Guid.NewGuid();
        var ageGroupId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var expected = new ClubMatchesDto();

        var mediator = new TestMediator();
        mediator.Register<GetMatchesByClubIdQuery, ClubMatchesDto>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/matches?ageGroupId={ageGroupId}&teamId={teamId}&status=upcoming");

        var response = await sut.GetClubMatches(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }
}
