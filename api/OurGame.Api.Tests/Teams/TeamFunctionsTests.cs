using MediatR;
using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Teams.Queries.GetMyTeamsAndClubs;
using OurGame.Application.UseCases.Teams.Queries.GetMyTeamsAndClubs.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByAgeGroupId;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByAgeGroupId.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview;
using OurGame.Application.UseCases.Teams.Queries.GetTeamOverview.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetPlayersByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetPlayersByTeamId.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetMatchesByTeamId.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetTrainingSessionsByTeamId.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId;
using OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId.DTOs;
using OurGame.Application.UseCases.Teams.Queries.GetReportCardsByTeamId;
using OurGame.Application.UseCases.Clubs.Queries.GetReportCardsByClubId.DTOs;
using OurGame.Application.UseCases.Teams.Commands.CreateTeamKit;
using OurGame.Application.UseCases.Teams.Commands.CreateTeamKit.DTOs;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamKit;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamKit.DTOs;
using OurGame.Application.UseCases.Teams.Commands.DeleteTeamKit;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamSquadNumbers;
using OurGame.Application.UseCases.Teams.Commands.ArchiveTeam;
using OurGame.Application.UseCases.Teams.Commands.ArchiveTeam.DTOs;

namespace OurGame.Api.Tests.Teams;

public class TeamFunctionsTests
{
    // ── GetMyTeams ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetMyTeams_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/teams/me");

        var response = await sut.GetMyTeams(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMyTeams_ReturnsOk_WhenAuthenticated()
    {
        var authId = Guid.NewGuid().ToString("N");
        var expected = new List<TeamAndClubsListItemDto>();

        var mediator = new TestMediator();
        mediator.Register<GetMyTeamsAndClubsQuery, List<TeamAndClubsListItemDto>>((query, _) =>
            Task.FromResult(query.AuthId == authId ? expected : new List<TeamAndClubsListItemDto>()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", "https://localhost/v1/teams/me", authId);

        var response = await sut.GetMyTeams(req);

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<TeamAndClubsListItemDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetTeamsByAgeGroupId ────────────────────────────────────────────

    [Fact]
    public async Task GetTeamsByAgeGroupId_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/age-groups/some-id/teams");

        var response = await sut.GetTeamsByAgeGroupId(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTeamsByAgeGroupId_ReturnsBadRequest_WhenAgeGroupIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/age-groups/not-a-guid/teams", authId);

        var response = await sut.GetTeamsByAgeGroupId(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<TeamWithStatsDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamsByAgeGroupId_ReturnsOk_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var ageGroupId = Guid.NewGuid();
        var expected = new List<TeamWithStatsDto>();

        var mediator = new TestMediator();
        mediator.Register<GetTeamsByAgeGroupIdQuery, List<TeamWithStatsDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/age-groups/{ageGroupId}/teams", authId);

        var response = await sut.GetTeamsByAgeGroupId(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<TeamWithStatsDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetTeamOverview ─────────────────────────────────────────────────

    [Fact]
    public async Task GetTeamOverview_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/teams/some-id/overview");

        var response = await sut.GetTeamOverview(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTeamOverview_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/teams/not-a-guid/overview", authId);

        var response = await sut.GetTeamOverview(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamOverview_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetTeamOverviewQuery, TeamOverviewDto?>((_, _) =>
            Task.FromResult<TeamOverviewDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/overview", authId);

        var response = await sut.GetTeamOverview(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Team not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamOverview_ReturnsOk_WhenTeamExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var expected = new TeamOverviewDto();

        var mediator = new TestMediator();
        mediator.Register<GetTeamOverviewQuery, TeamOverviewDto?>((_, _) =>
            Task.FromResult<TeamOverviewDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/overview", authId);

        var response = await sut.GetTeamOverview(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamOverviewDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetTeamPlayers ──────────────────────────────────────────────────

    [Fact]
    public async Task GetTeamPlayers_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/teams/some-id/players");

        var response = await sut.GetTeamPlayers(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTeamPlayers_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/teams/not-a-guid/players", authId);

        var response = await sut.GetTeamPlayers(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<TeamPlayerDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamPlayers_ReturnsOk_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var expected = new List<TeamPlayerDto>();

        var mediator = new TestMediator();
        mediator.Register<GetPlayersByTeamIdQuery, List<TeamPlayerDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/players", authId);

        var response = await sut.GetTeamPlayers(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<TeamPlayerDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetTeamCoaches ──────────────────────────────────────────────────

    [Fact]
    public async Task GetTeamCoaches_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/teams/some-id/coaches");

        var response = await sut.GetTeamCoaches(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTeamCoaches_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/teams/not-a-guid/coaches", authId);

        var response = await sut.GetTeamCoaches(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs.TeamCoachDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamCoaches_ReturnsOk_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var expected = new List<OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs.TeamCoachDto>();

        var mediator = new TestMediator();
        mediator.Register<GetCoachesByTeamIdQuery, List<OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs.TeamCoachDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/coaches", authId);

        var response = await sut.GetTeamCoaches(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<OurGame.Application.UseCases.Teams.Queries.GetCoachesByTeamId.DTOs.TeamCoachDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetTeamMatches ──────────────────────────────────────────────────

    [Fact]
    public async Task GetTeamMatches_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/teams/some-id/matches");

        var response = await sut.GetTeamMatches(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTeamMatches_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/teams/not-a-guid/matches", authId);

        var response = await sut.GetTeamMatches(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamMatchesDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamMatches_ReturnsNotFound_WhenKeyNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetMatchesByTeamIdQuery, TeamMatchesDto>((_, _) =>
            throw new KeyNotFoundException("Team not found"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/matches", authId);

        var response = await sut.GetTeamMatches(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamMatchesDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Team not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamMatches_ReturnsOk_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var expected = new TeamMatchesDto();

        var mediator = new TestMediator();
        mediator.Register<GetMatchesByTeamIdQuery, TeamMatchesDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/matches", authId);

        var response = await sut.GetTeamMatches(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamMatchesDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetTeamTrainingSessions ─────────────────────────────────────────

    [Fact]
    public async Task GetTeamTrainingSessions_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/teams/some-id/training-sessions");

        var response = await sut.GetTeamTrainingSessions(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTeamTrainingSessions_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/teams/not-a-guid/training-sessions", authId);

        var response = await sut.GetTeamTrainingSessions(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamTrainingSessionsDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamTrainingSessions_ReturnsNotFound_WhenKeyNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetTrainingSessionsByTeamIdQuery, TeamTrainingSessionsDto>((_, _) =>
            throw new KeyNotFoundException("Team not found"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/training-sessions", authId);

        var response = await sut.GetTeamTrainingSessions(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamTrainingSessionsDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Team not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamTrainingSessions_ReturnsOk_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var expected = new TeamTrainingSessionsDto();

        var mediator = new TestMediator();
        mediator.Register<GetTrainingSessionsByTeamIdQuery, TeamTrainingSessionsDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/training-sessions", authId);

        var response = await sut.GetTeamTrainingSessions(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamTrainingSessionsDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetTeamKits ─────────────────────────────────────────────────────

    [Fact]
    public async Task GetTeamKits_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/teams/some-id/kits");

        var response = await sut.GetTeamKits(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTeamKits_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/teams/not-a-guid/kits", authId);

        var response = await sut.GetTeamKits(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamKitsDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamKits_ReturnsNotFound_WhenResultIsNotFound()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetKitsByTeamIdQuery, Result<TeamKitsDto>>((_, _) =>
            Task.FromResult(Result<TeamKitsDto>.NotFound("Team not found")));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/kits", authId);

        var response = await sut.GetTeamKits(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamKitsDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Team not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamKits_ReturnsOk_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var expected = new TeamKitsDto();

        var mediator = new TestMediator();
        mediator.Register<GetKitsByTeamIdQuery, Result<TeamKitsDto>>((_, _) =>
            Task.FromResult(Result<TeamKitsDto>.Success(expected)));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/kits", authId);

        var response = await sut.GetTeamKits(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamKitsDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── GetTeamReportCards ──────────────────────────────────────────────

    [Fact]
    public async Task GetTeamReportCards_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/teams/some-id/report-cards");

        var response = await sut.GetTeamReportCards(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetTeamReportCards_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/teams/not-a-guid/report-cards", authId);

        var response = await sut.GetTeamReportCards(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubReportCardDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamReportCards_ReturnsOk_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var expected = new List<ClubReportCardDto>();

        var mediator = new TestMediator();
        mediator.Register<GetReportCardsByTeamIdQuery, List<ClubReportCardDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/report-cards", authId);

        var response = await sut.GetTeamReportCards(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubReportCardDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
    }

    // ── CreateTeamKit ───────────────────────────────────────────────────

    [Fact]
    public async Task CreateTeamKit_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/teams/some-id/kits");

        var response = await sut.CreateTeamKit(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateTeamKit_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/teams/not-a-guid/kits", authId);

        var response = await sut.CreateTeamKit(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateTeamKit_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/kits", authId, body: "null");

        var response = await sut.CreateTeamKit(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateTeamKit_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"name\":\"Home Kit\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateTeamKitCommand, TeamKitDto>((_, _) =>
            throw new NotFoundException("Team", teamId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/kits", authId, body);

        var response = await sut.CreateTeamKit(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateTeamKit_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"name\":\"\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateTeamKitCommand, TeamKitDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/kits", authId, body);

        var response = await sut.CreateTeamKit(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateTeamKit_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"name\":\"Home Kit\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateTeamKitCommand, TeamKitDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/kits", authId, body);

        var response = await sut.CreateTeamKit(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the team kit", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateTeamKit_ReturnsCreated_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"name\":\"Home Kit\"}";
        var expected = new TeamKitDto { Id = Guid.NewGuid() };

        var mediator = new TestMediator();
        mediator.Register<CreateTeamKitCommand, TeamKitDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/teams/{teamId}/kits", authId, body);

        var response = await sut.CreateTeamKit(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamKitDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(201, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
    }

    // ── UpdateTeamKit ───────────────────────────────────────────────────

    [Fact]
    public async Task UpdateTeamKit_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/teams/some-id/kits/some-kit");

        var response = await sut.UpdateTeamKit(req, Guid.NewGuid().ToString(), Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTeamKit_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/teams/not-a-guid/kits/some-kit", authId);

        var response = await sut.UpdateTeamKit(req, "not-a-guid", Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeamKit_ReturnsBadRequest_WhenKitIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/kits/not-a-guid", authId);

        var response = await sut.UpdateTeamKit(req, teamId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid kit ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeamKit_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/kits/{kitId}", authId, body: "null");

        var response = await sut.UpdateTeamKit(req, teamId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamKitDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeamKit_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var body = "{\"name\":\"Away Kit\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamKitCommand, TeamKitDto>((_, _) =>
            throw new NotFoundException("Kit", kitId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/kits/{kitId}", authId, body);

        var response = await sut.UpdateTeamKit(req, teamId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTeamKit_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var body = "{\"name\":\"\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamKitCommand, TeamKitDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/kits/{kitId}", authId, body);

        var response = await sut.UpdateTeamKit(req, teamId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateTeamKit_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var body = "{\"name\":\"Away Kit\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamKitCommand, TeamKitDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/kits/{kitId}", authId, body);

        var response = await sut.UpdateTeamKit(req, teamId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the team kit", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeamKit_ReturnsOk_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var kitId = Guid.NewGuid();
        var body = "{\"name\":\"Away Kit\"}";
        var expected = new TeamKitDto { Id = kitId };

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamKitCommand, TeamKitDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/kits/{kitId}", authId, body);

        var response = await sut.UpdateTeamKit(req, teamId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamKitDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
    }

    // ── DeleteTeamKit ───────────────────────────────────────────────────

    [Fact]
    public async Task DeleteTeamKit_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("DELETE", "https://localhost/v1/teams/some-id/kits/some-kit");

        var response = await sut.DeleteTeamKit(req, Guid.NewGuid().ToString(), Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTeamKit_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", "https://localhost/v1/teams/not-a-guid/kits/some-kit", authId);

        var response = await sut.DeleteTeamKit(req, "not-a-guid", Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task DeleteTeamKit_ReturnsBadRequest_WhenKitIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/kits/not-a-guid", authId);

        var response = await sut.DeleteTeamKit(req, teamId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid kit ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task DeleteTeamKit_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var kitId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeleteTeamKitCommand>((_, _) =>
            throw new NotFoundException("Kit", kitId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/kits/{kitId}", authId);

        var response = await sut.DeleteTeamKit(req, teamId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTeamKit_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var kitId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeleteTeamKitCommand>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/kits/{kitId}", authId);

        var response = await sut.DeleteTeamKit(req, teamId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while deleting the team kit", payload.Error?.Message);
    }

    [Fact]
    public async Task DeleteTeamKit_ReturnsNoContent_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var kitId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeleteTeamKitCommand>((_, _) =>
            Task.CompletedTask);

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/teams/{teamId}/kits/{kitId}", authId);

        var response = await sut.DeleteTeamKit(req, teamId.ToString(), kitId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    // ── UpdateTeamSquadNumbers ──────────────────────────────────────────

    [Fact]
    public async Task UpdateTeamSquadNumbers_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/teams/some-id/squad-numbers");

        var response = await sut.UpdateTeamSquadNumbers(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTeamSquadNumbers_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/teams/not-a-guid/squad-numbers", authId);

        var response = await sut.UpdateTeamSquadNumbers(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeamSquadNumbers_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/squad-numbers", authId, body: "null");

        var response = await sut.UpdateTeamSquadNumbers(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    // Note: Assignments == null branch is unreachable — the DTO initializes Assignments = new()

    [Fact]
    public async Task UpdateTeamSquadNumbers_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"assignments\":[]}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamSquadNumbersCommand, Result>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/squad-numbers", authId, body);

        var response = await sut.UpdateTeamSquadNumbers(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating squad numbers", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateTeamSquadNumbers_ReturnsOk_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"assignments\":[]}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamSquadNumbersCommand, Result>((_, _) =>
            Task.FromResult(Result.Success()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/squad-numbers", authId, body);

        var response = await sut.UpdateTeamSquadNumbers(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
    }

    // ── ArchiveTeam ─────────────────────────────────────────────────────

    [Fact]
    public async Task ArchiveTeam_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/teams/some-id/archive");

        var response = await sut.ArchiveTeam(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ArchiveTeam_ReturnsBadRequest_WhenTeamIdInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/teams/not-a-guid/archive", authId);

        var response = await sut.ArchiveTeam(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid team ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task ArchiveTeam_ReturnsBadRequest_WhenBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/archive", authId, body: "null");

        var response = await sut.ArchiveTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task ArchiveTeam_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"isArchived\":true}";

        var mediator = new TestMediator();
        mediator.Register<ArchiveTeamCommand>((_, _) =>
            throw new NotFoundException("Team", teamId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/archive", authId, body);

        var response = await sut.ArchiveTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ArchiveTeam_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"isArchived\":true}";

        var mediator = new TestMediator();
        mediator.Register<ArchiveTeamCommand>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/archive", authId, body);

        var response = await sut.ArchiveTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating team archive status", payload.Error?.Message);
    }

    [Fact]
    public async Task ArchiveTeam_ReturnsNoContent_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"isArchived\":true}";

        var mediator = new TestMediator();
        mediator.Register<ArchiveTeamCommand>((_, _) =>
            Task.CompletedTask);

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/archive", authId, body);

        var response = await sut.ArchiveTeam(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static TeamFunctions BuildSut(TestMediator mediator)
    {
        return new TeamFunctions(mediator, NullLogger<TeamFunctions>.Instance);
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

    // ── GetTeamMatches – additional date query param tests ──────────

    [Fact]
    public async Task GetTeamMatches_ReturnsBadRequest_WhenDateFromInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();

        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/matches?dateFrom=not-a-date", authId);

        var response = await sut.GetTeamMatches(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamMatchesDto>(response);
        Assert.False(payload.Success);
        Assert.Contains("Invalid dateFrom format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamMatches_ReturnsBadRequest_WhenDateToInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();

        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/matches?dateTo=bad-date", authId);

        var response = await sut.GetTeamMatches(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamMatchesDto>(response);
        Assert.False(payload.Success);
        Assert.Contains("Invalid dateTo format", payload.Error?.Message);
    }

    // ── GetTeamTrainingSessions – additional date query param tests ──

    [Fact]
    public async Task GetTeamTrainingSessions_ReturnsBadRequest_WhenDateFromInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();

        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/training-sessions?dateFrom=xyz", authId);

        var response = await sut.GetTeamTrainingSessions(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamTrainingSessionsDto>(response);
        Assert.Contains("Invalid dateFrom format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetTeamTrainingSessions_ReturnsBadRequest_WhenDateToInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();

        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/teams/{teamId}/training-sessions?dateTo=xyz", authId);

        var response = await sut.GetTeamTrainingSessions(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<TeamTrainingSessionsDto>(response);
        Assert.Contains("Invalid dateTo format", payload.Error?.Message);
    }

    // ── UpdateTeamSquadNumbers – additional coverage ────────────────

    [Fact]
    public async Task UpdateTeamSquadNumbers_ReturnsNotFound_WhenResultIsNotFound()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"assignments\":[{\"playerId\":\"" + Guid.NewGuid() + "\",\"squadNumber\":10}]}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamSquadNumbersCommand, Result>((_, _) =>
            Task.FromResult(Result.NotFound("Team or players not found")));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/squad-numbers", authId, body);

        var response = await sut.UpdateTeamSquadNumbers(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateTeamSquadNumbers_ReturnsBadRequest_WhenResultIsFailure()
    {
        var authId = Guid.NewGuid().ToString("N");
        var teamId = Guid.NewGuid();
        var body = "{\"assignments\":[{\"playerId\":\"" + Guid.NewGuid() + "\",\"squadNumber\":10}]}";

        var mediator = new TestMediator();
        mediator.Register<UpdateTeamSquadNumbersCommand, Result>((_, _) =>
            Task.FromResult(Result.Failure("Squad number conflict")));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/teams/{teamId}/squad-numbers", authId, body);

        var response = await sut.UpdateTeamSquadNumbers(req, teamId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }
}
