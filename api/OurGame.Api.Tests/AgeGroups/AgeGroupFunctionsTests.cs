using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupsByClubId;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupsByClubId.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupStatistics;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupStatistics.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetPlayersByAgeGroupId;
using OurGame.Application.UseCases.AgeGroups.Queries.GetPlayersByAgeGroupId.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetCoachesByAgeGroupId;
using OurGame.Application.UseCases.AgeGroups.Queries.GetCoachesByAgeGroupId.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetReportCardsByAgeGroupId;
using OurGame.Application.UseCases.Clubs.Queries.GetReportCardsByClubId.DTOs;
using OurGame.Application.UseCases.AgeGroups.Commands.CreateAgeGroup;
using OurGame.Application.UseCases.AgeGroups.Commands.CreateAgeGroup.DTOs;

namespace OurGame.Api.Tests.AgeGroups;

public class AgeGroupFunctionsTests
{
    // ───────────────────────────────────────────────
    // GetAgeGroupsByClubId
    // ───────────────────────────────────────────────

    [Fact]
    public async Task GetAgeGroupsByClubId_ReturnsBadRequest_WhenClubIdIsInvalid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/not-a-guid/age-groups");

        var response = await sut.GetAgeGroupsByClubId(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<AgeGroupListDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetAgeGroupsByClubId_ReturnsOk_WhenClubIdIsValid()
    {
        var clubId = Guid.NewGuid();
        var expected = new List<AgeGroupListDto>
        {
            new() { Id = Guid.NewGuid(), Name = "Under 10s" }
        };

        var mediator = new TestMediator();
        mediator.Register<GetAgeGroupsByClubIdQuery, List<AgeGroupListDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/age-groups");

        var response = await sut.GetAgeGroupsByClubId(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<AgeGroupListDto>>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
        Assert.Equal("Under 10s", payload.Data[0].Name);
    }

    // ───────────────────────────────────────────────
    // GetAgeGroupById
    // ───────────────────────────────────────────────

    [Fact]
    public async Task GetAgeGroupById_ReturnsBadRequest_WhenAgeGroupIdIsInvalid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/age-groups/not-a-guid");

        var response = await sut.GetAgeGroupById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetAgeGroupById_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var ageGroupId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetAgeGroupByIdQuery, AgeGroupDetailDto?>((_, _) =>
            Task.FromResult<AgeGroupDetailDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/age-groups/{ageGroupId}");

        var response = await sut.GetAgeGroupById(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Age group not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetAgeGroupById_ReturnsOk_WhenAgeGroupExists()
    {
        var ageGroupId = Guid.NewGuid();
        var expected = new AgeGroupDetailDto { Id = ageGroupId, Name = "Under 12s" };

        var mediator = new TestMediator();
        mediator.Register<GetAgeGroupByIdQuery, AgeGroupDetailDto?>((_, _) =>
            Task.FromResult<AgeGroupDetailDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/age-groups/{ageGroupId}");

        var response = await sut.GetAgeGroupById(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal(ageGroupId, payload.Data!.Id);
        Assert.Equal("Under 12s", payload.Data.Name);
    }

    // ───────────────────────────────────────────────
    // GetAgeGroupStatistics
    // ───────────────────────────────────────────────

    [Fact]
    public async Task GetAgeGroupStatistics_ReturnsBadRequest_WhenAgeGroupIdIsInvalid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/age-groups/not-a-guid/statistics");

        var response = await sut.GetAgeGroupStatistics(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupStatisticsDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetAgeGroupStatistics_ReturnsOk_WhenAgeGroupIdIsValid()
    {
        var ageGroupId = Guid.NewGuid();
        var expected = new AgeGroupStatisticsDto { PlayerCount = 18 };

        var mediator = new TestMediator();
        mediator.Register<GetAgeGroupStatisticsQuery, AgeGroupStatisticsDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/age-groups/{ageGroupId}/statistics");

        var response = await sut.GetAgeGroupStatistics(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupStatisticsDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal(18, payload.Data!.PlayerCount);
    }

    // ───────────────────────────────────────────────
    // GetPlayersByAgeGroupId
    // ───────────────────────────────────────────────

    [Fact]
    public async Task GetPlayersByAgeGroupId_ReturnsBadRequest_WhenAgeGroupIdIsInvalid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/age-groups/not-a-guid/players");

        var response = await sut.GetPlayersByAgeGroupId(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<AgeGroupPlayerDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetPlayersByAgeGroupId_ReturnsOk_WhenAgeGroupIdIsValid()
    {
        var ageGroupId = Guid.NewGuid();
        var expected = new List<AgeGroupPlayerDto>
        {
            new() { Id = Guid.NewGuid(), FirstName = "Alex", LastName = "Smith" }
        };

        var mediator = new TestMediator();
        mediator.Register<GetPlayersByAgeGroupIdQuery, List<AgeGroupPlayerDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/age-groups/{ageGroupId}/players");

        var response = await sut.GetPlayersByAgeGroupId(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<AgeGroupPlayerDto>>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
        Assert.Equal("Alex", payload.Data[0].FirstName);
    }

    // ───────────────────────────────────────────────
    // GetCoachesByAgeGroupId
    // ───────────────────────────────────────────────

    [Fact]
    public async Task GetCoachesByAgeGroupId_ReturnsBadRequest_WhenAgeGroupIdIsInvalid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/age-groups/not-a-guid/coaches");

        var response = await sut.GetCoachesByAgeGroupId(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<AgeGroupCoachDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetCoachesByAgeGroupId_ReturnsOk_WhenAgeGroupIdIsValid()
    {
        var ageGroupId = Guid.NewGuid();
        var expected = new List<AgeGroupCoachDto>
        {
            new() { Id = Guid.NewGuid(), FirstName = "Jamie", LastName = "Coach" }
        };

        var mediator = new TestMediator();
        mediator.Register<GetCoachesByAgeGroupIdQuery, List<AgeGroupCoachDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/age-groups/{ageGroupId}/coaches");

        var response = await sut.GetCoachesByAgeGroupId(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<AgeGroupCoachDto>>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
        Assert.Equal("Jamie", payload.Data[0].FirstName);
    }

    // ───────────────────────────────────────────────
    // GetAgeGroupReportCards
    // ───────────────────────────────────────────────

    [Fact]
    public async Task GetAgeGroupReportCards_ReturnsBadRequest_WhenAgeGroupIdIsInvalid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/age-groups/not-a-guid/report-cards");

        var response = await sut.GetAgeGroupReportCards(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubReportCardDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid age group ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetAgeGroupReportCards_ReturnsOk_WhenAgeGroupIdIsValid()
    {
        var ageGroupId = Guid.NewGuid();
        var expected = new List<ClubReportCardDto>
        {
            new() { Id = Guid.NewGuid() }
        };

        var mediator = new TestMediator();
        mediator.Register<GetReportCardsByAgeGroupIdQuery, List<ClubReportCardDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/age-groups/{ageGroupId}/report-cards");

        var response = await sut.GetAgeGroupReportCards(req, ageGroupId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubReportCardDto>>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
    }

    // ───────────────────────────────────────────────
    // CreateAgeGroup
    // ───────────────────────────────────────────────

    [Fact]
    public async Task CreateAgeGroup_ReturnsBadRequest_WhenClubIdIsInvalid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/clubs/not-a-guid/age-groups", body: "{}");

        var response = await sut.CreateAgeGroup(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateAgeGroup_ReturnsBadRequest_WhenBodyIsNull()
    {
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/age-groups", body: "null");

        var response = await sut.CreateAgeGroup(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateAgeGroup_ReturnsBadRequest_WhenClubIdMismatch()
    {
        var routeClubId = Guid.NewGuid();
        var bodyClubId = Guid.NewGuid();
        var body = System.Text.Json.JsonSerializer.Serialize(new CreateAgeGroupDto
        {
            ClubId = bodyClubId,
            Name = "Under 10s",
            Code = "U10",
            Level = "youth",
            Season = "2025/26",
            DefaultSquadSize = 14
        });

        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{routeClubId}/age-groups", body: body);

        var response = await sut.CreateAgeGroup(req, routeClubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Club ID in URL does not match request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateAgeGroup_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var clubId = Guid.NewGuid();
        var body = System.Text.Json.JsonSerializer.Serialize(new CreateAgeGroupDto
        {
            ClubId = clubId,
            Name = "Under 10s",
            Code = "U10",
            Level = "youth",
            Season = "2025/26",
            DefaultSquadSize = 14
        });

        var mediator = new TestMediator();
        mediator.Register<CreateAgeGroupCommand, AgeGroupDetailDto>((_, _) =>
            throw new NotFoundException("Club", clubId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/age-groups", body: body);

        var response = await sut.CreateAgeGroup(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task CreateAgeGroup_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var clubId = Guid.NewGuid();
        var body = System.Text.Json.JsonSerializer.Serialize(new CreateAgeGroupDto
        {
            ClubId = clubId,
            Name = "",
            Code = "",
            Level = "youth",
            Season = "2025/26",
            DefaultSquadSize = 14
        });

        var mediator = new TestMediator();
        mediator.Register<CreateAgeGroupCommand, AgeGroupDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/age-groups", body: body);

        var response = await sut.CreateAgeGroup(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateAgeGroup_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var clubId = Guid.NewGuid();
        var body = System.Text.Json.JsonSerializer.Serialize(new CreateAgeGroupDto
        {
            ClubId = clubId,
            Name = "Under 10s",
            Code = "U10",
            Level = "youth",
            Season = "2025/26",
            DefaultSquadSize = 14
        });

        var mediator = new TestMediator();
        mediator.Register<CreateAgeGroupCommand, AgeGroupDetailDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/age-groups", body: body);

        var response = await sut.CreateAgeGroup(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the age group", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateAgeGroup_ReturnsCreated_WhenRequestIsValid()
    {
        var clubId = Guid.NewGuid();
        var resultId = Guid.NewGuid();
        var body = System.Text.Json.JsonSerializer.Serialize(new CreateAgeGroupDto
        {
            ClubId = clubId,
            Name = "Under 10s",
            Code = "U10",
            Level = "youth",
            Season = "2025/26",
            DefaultSquadSize = 14
        });

        var mediator = new TestMediator();
        mediator.Register<CreateAgeGroupCommand, AgeGroupDetailDto>((cmd, _) =>
            Task.FromResult(new AgeGroupDetailDto { Id = resultId, Name = "Under 10s" }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/age-groups", body: body);

        var response = await sut.CreateAgeGroup(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AgeGroupDetailDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal(resultId, payload.Data!.Id);
        Assert.Equal("Under 10s", payload.Data.Name);
    }

    // ───────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────

    private static AgeGroupFunctions BuildSut(TestMediator mediator)
    {
        return new AgeGroupFunctions(mediator, NullLogger<AgeGroupFunctions>.Instance);
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
