using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Invites.Commands.AcceptInvite;
using OurGame.Application.UseCases.Invites.Commands.AcceptInvite.DTOs;
using OurGame.Application.UseCases.Invites.Commands.CreateInvite;
using OurGame.Application.UseCases.Invites.Commands.CreateInvite.DTOs;
using OurGame.Application.UseCases.Invites.Commands.RevokeInvite;
using OurGame.Application.UseCases.Invites.Queries.GetClubInvites;
using OurGame.Application.UseCases.Invites.Queries.GetClubInvites.DTOs;
using OurGame.Application.UseCases.Invites.Queries.GetInviteByCode;
using OurGame.Application.UseCases.Invites.Queries.GetInviteByCode.DTOs;
using OurGame.Persistence.Enums;

namespace OurGame.Api.Tests.Invites;

public class InviteFunctionsTests
{
    // ─── CreateInvite ─────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateInvite_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/invites",
            "{\"email\":\"test@test.com\",\"type\":0,\"entityId\":\"00000000-0000-0000-0000-000000000001\",\"clubId\":\"00000000-0000-0000-0000-000000000002\"}");

        var response = await sut.CreateInvite(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task CreateInvite_ReturnsCreated_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var expected = new InviteDto
        {
            Id = Guid.NewGuid(),
            Code = "ABC12345",
            Email = "coach@test.com",
            Type = InviteType.Coach,
            EntityId = Guid.NewGuid(),
            ClubId = Guid.NewGuid(),
            ClubName = "Vale FC",
            Status = InviteStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        var mediator = new TestMediator();
        mediator.Register<CreateInviteCommand, InviteDto>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var body = $"{{\"email\":\"coach@test.com\",\"type\":0,\"entityId\":\"{expected.EntityId}\",\"clubId\":\"{expected.ClubId}\"}}";
        var req = CreateAuthedRequest("POST", "https://localhost/v1/invites", authId, body);

        var response = await sut.CreateInvite(req);

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<InviteDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal("ABC12345", payload.Data!.Code);
    }

    [Fact]
    public async Task CreateInvite_ReturnsBadRequest_WhenNullBody()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/invites", authId, "null");

        var response = await sut.CreateInvite(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
    }

    [Fact]
    public async Task CreateInvite_ReturnsBadRequest_WhenValidationFails()
    {
        var authId = Guid.NewGuid().ToString("N");
        var mediator = new TestMediator();
        mediator.Register<CreateInviteCommand, InviteDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["EntityId"] = new[] { "This coach already has an account linked." }
            }));

        var sut = BuildSut(mediator);
        var body = $"{{\"email\":\"coach@test.com\",\"type\":0,\"entityId\":\"{Guid.NewGuid()}\",\"clubId\":\"{Guid.NewGuid()}\"}}";
        var req = CreateAuthedRequest("POST", "https://localhost/v1/invites", authId, body);

        var response = await sut.CreateInvite(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
    }

    // ─── GetInviteByCode ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetInviteByCode_ReturnsOk_ForValidPendingInvite()
    {
        var expected = new InviteDetailsDto
        {
            Code = "ABC12345",
            MaskedEmail = "c****@test.com",
            Type = InviteType.Coach,
            ClubName = "Vale FC",
            Status = InviteStatus.Pending,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        var mediator = new TestMediator();
        mediator.Register<GetInviteByCodeQuery, InviteDetailsDto>((query, _) =>
            Task.FromResult(query.Code == "ABC12345" ? expected : throw new NotFoundException("Invite", query.Code)));

        var sut = BuildSut(mediator);
        var req = CreateRequest("GET", "https://localhost/v1/invites/ABC12345");

        var response = await sut.GetInviteByCode(req, "ABC12345");

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<InviteDetailsDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal("Vale FC", payload.Data!.ClubName);
    }

    [Fact]
    public async Task GetInviteByCode_ReturnsNotFound_ForInvalidCode()
    {
        var mediator = new TestMediator();
        mediator.Register<GetInviteByCodeQuery, InviteDetailsDto>((query, _) =>
            throw new NotFoundException("Invite", query.Code));

        var sut = BuildSut(mediator);
        var req = CreateRequest("GET", "https://localhost/v1/invites/NOTFOUND");

        var response = await sut.GetInviteByCode(req, "NOTFOUND");

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal("NOT_FOUND", payload.Error?.Code);
    }

    // ─── AcceptInvite ─────────────────────────────────────────────────────────

    [Fact]
    public async Task AcceptInvite_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/invites/ABC12345/accept", "{}");

        var response = await sut.AcceptInvite(req, "ABC12345");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task AcceptInvite_ReturnsBadRequest_WhenInviteExpired()
    {
        var authId = Guid.NewGuid().ToString("N");
        var mediator = new TestMediator();
        mediator.Register<AcceptInviteCommand, AcceptInviteResultDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Code"] = new[] { "This invite has expired." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/invites/EXPIRED1/accept", authId, "{}");

        var response = await sut.AcceptInvite(req, "EXPIRED1");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
    }

    [Fact]
    public async Task AcceptInvite_ReturnsBadRequest_WhenEmailMismatch()
    {
        var authId = Guid.NewGuid().ToString("N");
        var mediator = new TestMediator();
        mediator.Register<AcceptInviteCommand, AcceptInviteResultDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Email"] = new[] { "Your account email does not match the invite email." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/invites/ABC12345/accept", authId, "{}");

        var response = await sut.AcceptInvite(req, "ABC12345");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
    }

    [Fact]
    public async Task AcceptInvite_ReturnsOk_WhenCoachInviteAccepted()
    {
        var authId = Guid.NewGuid().ToString("N");
        var inviteId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<AcceptInviteCommand, AcceptInviteResultDto>((_, _) =>
            Task.FromResult(new AcceptInviteResultDto
            {
                InviteId = inviteId,
                Message = "Invite accepted successfully. Your account has been linked."
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/invites/ABC12345/accept", authId,
            "{\"firstName\":\"Jamie\",\"lastName\":\"Coach\"}");

        var response = await sut.AcceptInvite(req, "ABC12345");

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AcceptInviteResultDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal(inviteId, payload.Data!.InviteId);
    }

    [Fact]
    public async Task AcceptInvite_ReturnsOk_WhenPlayerInviteAccepted()
    {
        var authId = Guid.NewGuid().ToString("N");
        var inviteId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<AcceptInviteCommand, AcceptInviteResultDto>((_, _) =>
            Task.FromResult(new AcceptInviteResultDto
            {
                InviteId = inviteId,
                Message = "Invite accepted successfully. Your account has been linked."
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/invites/PLAYER12/accept", authId,
            "{\"firstName\":\"Alex\",\"lastName\":\"Smith\"}");

        var response = await sut.AcceptInvite(req, "PLAYER12");

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AcceptInviteResultDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(inviteId, payload.Data!.InviteId);
    }

    [Fact]
    public async Task AcceptInvite_ReturnsOk_WhenParentInviteAccepted()
    {
        var authId = Guid.NewGuid().ToString("N");
        var inviteId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<AcceptInviteCommand, AcceptInviteResultDto>((_, _) =>
            Task.FromResult(new AcceptInviteResultDto
            {
                InviteId = inviteId,
                Message = "Invite accepted successfully. Your account has been linked."
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/invites/PARENT12/accept", authId,
            "{\"firstName\":\"Sarah\",\"lastName\":\"Smith\"}");

        var response = await sut.AcceptInvite(req, "PARENT12");

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<AcceptInviteResultDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(inviteId, payload.Data!.InviteId);
    }

    [Fact]
    public async Task AcceptInvite_ReturnsNotFound_WhenInvalidCode()
    {
        var authId = Guid.NewGuid().ToString("N");
        var mediator = new TestMediator();
        mediator.Register<AcceptInviteCommand, AcceptInviteResultDto>((_, _) =>
            throw new NotFoundException("Invite", "NOTFOUND"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/invites/NOTFOUND/accept", authId, "{}");

        var response = await sut.AcceptInvite(req, "NOTFOUND");

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal("NOT_FOUND", payload.Error?.Code);
    }

    // ─── RevokeInvite ─────────────────────────────────────────────────────────

    [Fact]
    public async Task RevokeInvite_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("DELETE", $"https://localhost/v1/invites/{Guid.NewGuid()}");

        var response = await sut.RevokeInvite(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RevokeInvite_ReturnsBadRequest_WhenInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("DELETE", "https://localhost/v1/invites/not-a-guid", authId);

        var response = await sut.RevokeInvite(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RevokeInvite_ReturnsOk_WhenValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var inviteId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<RevokeInviteCommand, bool>((_, _) => Task.FromResult(true));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/invites/{inviteId}", authId);

        var response = await sut.RevokeInvite(req, inviteId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }

    // ─── GetClubInvites ───────────────────────────────────────────────────────

    [Fact]
    public async Task GetClubInvites_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", $"https://localhost/v1/clubs/{Guid.NewGuid()}/invites");

        var response = await sut.GetClubInvites(req, Guid.NewGuid().ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetClubInvites_ReturnsBadRequest_WhenInvalidClubId()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/not-a-guid/invites", authId);

        var response = await sut.GetClubInvites(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetClubInvites_ReturnsOk_WhenAuthenticated()
    {
        var authId = Guid.NewGuid().ToString("N");
        var clubId = Guid.NewGuid();
        var expected = new List<ClubInviteDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Code = "ABC12345",
                Email = "coach@test.com",
                Type = InviteType.Coach,
                EntityId = Guid.NewGuid(),
                Status = InviteStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            }
        };

        var mediator = new TestMediator();
        mediator.Register<GetClubInvitesQuery, List<ClubInviteDto>>((_, _) => Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/invites", authId);

        var response = await sut.GetClubInvites(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubInviteDto>>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
        Assert.Equal("ABC12345", payload.Data[0].Code);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static InviteFunctions BuildSut(TestMediator mediator)
    {
        return new InviteFunctions(mediator, NullLogger<InviteFunctions>.Instance);
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
