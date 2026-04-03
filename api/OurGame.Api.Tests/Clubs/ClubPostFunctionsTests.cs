using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.Clubs.Commands.CreateClubPost;
using OurGame.Application.UseCases.Clubs.Commands.DeleteClubPost;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubPost;
using OurGame.Application.UseCases.Clubs.Queries.GetClubPosts;
using OurGame.Application.UseCases.Clubs.Queries.GetClubPosts.DTOs;
using OurGame.Application.UseCases.Clubs.Queries.GetPublicClubPostById;
using OurGame.Application.UseCases.Clubs.Queries.GetPublicClubPostById.DTOs;

namespace OurGame.Api.Tests.Clubs;

public class ClubPostFunctionsTests
{
    // ── GetClubPosts ─────────────────────────────────────────────────

    [Fact]
    public async Task GetClubPosts_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", $"https://localhost/v1/clubs/{clubId}/posts");

        var response = await sut.GetClubPosts(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetClubPosts_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/clubs/not-a-guid/posts");

        var response = await sut.GetClubPosts(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubPostDto>>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetClubPosts_ReturnsOk_WithEmptyList_WhenNoPosts()
    {
        var clubId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetClubPostsQuery, List<ClubPostDto>>((_, _) =>
            Task.FromResult(new List<ClubPostDto>()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/posts");

        var response = await sut.GetClubPosts(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubPostDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Empty(payload.Data!);
    }

    [Fact]
    public async Task GetClubPosts_ReturnsOk_WithPosts_WhenPostsExist()
    {
        var clubId = Guid.NewGuid();
        var expected = new List<ClubPostDto>
        {
            new() { Id = Guid.NewGuid(), ClubId = clubId, Title = "Welcome Post", PostType = "news" }
        };

        var mediator = new TestMediator();
        mediator.Register<GetClubPostsQuery, List<ClubPostDto>>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/clubs/{clubId}/posts");

        var response = await sut.GetClubPosts(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<List<ClubPostDto>>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Single(payload.Data!);
        Assert.Equal("Welcome Post", payload.Data![0].Title);
    }

    // ── CreateClubPost ───────────────────────────────────────────────

    [Fact]
    public async Task CreateClubPost_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", $"https://localhost/v1/clubs/{clubId}/posts", body: "{}");

        var response = await sut.CreateClubPost(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateClubPost_ReturnsBadRequest_WhenClubIdIsNotValidGuid()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/clubs/not-a-guid/posts", body: "{}");

        var response = await sut.CreateClubPost(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubPostDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid club ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateClubPost_ReturnsUnprocessableEntity_WhenValidationFails()
    {
        var clubId = Guid.NewGuid();
        var body = "{\"Title\":\"\",\"PostType\":\"news\"}";

        var mediator = new TestMediator();
        mediator.Register<CreateClubPostCommand, ClubPostDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Title"] = new[] { "Title is required" }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/posts", body: body);

        var response = await sut.CreateClubPost(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubPostDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateClubPost_ReturnsCreated_WhenSuccessful()
    {
        var clubId = Guid.NewGuid();
        var postId = Guid.NewGuid();
        var body = "{\"Title\":\"Welcome Post\",\"PostType\":\"news\",\"IsPublic\":true}";
        var expected = new ClubPostDto
        {
            Id = postId,
            ClubId = clubId,
            Title = "Welcome Post",
            PostType = "news",
            IsPublic = true
        };

        var mediator = new TestMediator();
        mediator.Register<CreateClubPostCommand, ClubPostDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", $"https://localhost/v1/clubs/{clubId}/posts", body: body);

        var response = await sut.CreateClubPost(req, clubId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubPostDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal(postId, payload.Data!.Id);
        Assert.Equal("Welcome Post", payload.Data.Title);
    }

    // ── UpdateClubPost ───────────────────────────────────────────────

    [Fact]
    public async Task UpdateClubPost_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        var clubId = Guid.NewGuid();
        var postId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", $"https://localhost/v1/clubs/{clubId}/posts/{postId}", body: "{}");

        var response = await sut.UpdateClubPost(req, clubId.ToString(), postId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateClubPost_ReturnsBadRequest_WhenPostIdIsNotValidGuid()
    {
        var clubId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/posts/not-a-guid", body: "{}");

        var response = await sut.UpdateClubPost(req, clubId.ToString(), "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubPostDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid post ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateClubPost_ReturnsNotFound_WhenPostNotFound()
    {
        var clubId = Guid.NewGuid();
        var postId = Guid.NewGuid();
        var body = "{\"Title\":\"Updated Post\",\"PostType\":\"news\"}";

        var mediator = new TestMediator();
        mediator.Register<UpdateClubPostCommand, ClubPostDto>((_, _) =>
            throw new NotFoundException("Post", postId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/posts/{postId}", body: body);

        var response = await sut.UpdateClubPost(req, clubId.ToString(), postId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubPostDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateClubPost_ReturnsOk_WhenSuccessful()
    {
        var clubId = Guid.NewGuid();
        var postId = Guid.NewGuid();
        var body = "{\"Title\":\"Updated Post\",\"PostType\":\"news\",\"IsPublic\":false}";
        var expected = new ClubPostDto
        {
            Id = postId,
            ClubId = clubId,
            Title = "Updated Post",
            PostType = "news",
            IsPublic = false
        };

        var mediator = new TestMediator();
        mediator.Register<UpdateClubPostCommand, ClubPostDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/clubs/{clubId}/posts/{postId}", body: body);

        var response = await sut.UpdateClubPost(req, clubId.ToString(), postId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ClubPostDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(postId, payload.Data!.Id);
        Assert.Equal("Updated Post", payload.Data.Title);
    }

    // ── DeleteClubPost ───────────────────────────────────────────────

    [Fact]
    public async Task DeleteClubPost_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        var clubId = Guid.NewGuid();
        var postId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("DELETE", $"https://localhost/v1/clubs/{clubId}/posts/{postId}");

        var response = await sut.DeleteClubPost(req, clubId.ToString(), postId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteClubPost_ReturnsNoContent_WhenSuccessful()
    {
        var clubId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<DeleteClubPostCommand>((_, _) => Task.CompletedTask);

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("DELETE", $"https://localhost/v1/clubs/{clubId}/posts/{postId}");

        var response = await sut.DeleteClubPost(req, clubId.ToString(), postId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    // ── GetPublicPost ────────────────────────────────────────────────

    [Fact]
    public async Task GetPublicPost_DoesNotRequireAuthentication()
    {
        var postId = Guid.NewGuid();
        var expected = new PublicClubPostDto
        {
            Id = postId,
            Title = "Public Post",
            PostType = "news",
            IsPublic = true,
            ClubId = Guid.NewGuid(),
            ClubName = "Vale FC"
        };

        var mediator = new TestMediator();
        mediator.Register<GetPublicClubPostByIdQuery, PublicClubPostDto?>((_, _) =>
            Task.FromResult<PublicClubPostDto?>(expected));

        var sut = BuildSut(mediator);
        // Create request WITHOUT auth header
        var req = CreateRequest("GET", $"https://localhost/v1/public/posts/{postId}");

        var response = await sut.GetPublicPost(req, postId.ToString());

        Assert.NotEqual(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetPublicPost_ReturnsNotFound_WhenPostNotFound()
    {
        var postId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetPublicClubPostByIdQuery, PublicClubPostDto?>((_, _) =>
            Task.FromResult<PublicClubPostDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateRequest("GET", $"https://localhost/v1/public/posts/{postId}");

        var response = await sut.GetPublicPost(req, postId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PublicClubPostDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Post not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetPublicPost_ReturnsOk_WhenPostIsPublic()
    {
        var postId = Guid.NewGuid();
        var clubId = Guid.NewGuid();
        var expected = new PublicClubPostDto
        {
            Id = postId,
            Title = "Public Post",
            PostType = "news",
            IsPublic = true,
            ClubId = clubId,
            ClubName = "Vale FC"
        };

        var mediator = new TestMediator();
        mediator.Register<GetPublicClubPostByIdQuery, PublicClubPostDto?>((_, _) =>
            Task.FromResult<PublicClubPostDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateRequest("GET", $"https://localhost/v1/public/posts/{postId}");

        var response = await sut.GetPublicPost(req, postId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<PublicClubPostDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(postId, payload.Data!.Id);
        Assert.Equal("Public Post", payload.Data.Title);
        Assert.Equal("Vale FC", payload.Data.ClubName);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private static ClubPostFunctions BuildSut(TestMediator mediator)
    {
        return new ClubPostFunctions(mediator, NullLogger<ClubPostFunctions>.Instance);
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
