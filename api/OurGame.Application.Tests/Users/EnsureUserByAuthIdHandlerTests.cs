using OurGame.Application.Abstractions;
using OurGame.Application.Services;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Users.Commands.EnsureUserByAuthId;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;

namespace OurGame.Application.Tests.Users;

public class EnsureUserByAuthIdHandlerTests
{
    // ────────────────────────────────────────────
    //  LocalB2CUserService
    // ────────────────────────────────────────────

    [Fact]
    public async Task LocalB2CUserService_AlwaysReturnsNull()
    {
        var sut = new LocalB2CUserService();

        var result = await sut.GetUserAsync("any-object-id");

        Assert.Null(result);
    }

    // ────────────────────────────────────────────
    //  EnsureUserByAuthIdHandler — existing user
    // ────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenUserAlreadyExists_ReturnsExistingProfile_AndDoesNotCallGraph()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-exists");

        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs.UserProfileDto?>(
            (q, ct) => new GetUserByAzureIdHandler(db.Context).Handle(q, ct));

        var b2CService = new StubB2CUserService();
        b2CService.Returns(new B2CUserProfile("graph@example.com", "Graph", "User", "Graph User"));

        var handler = new EnsureUserByAuthIdHandler(db.Context, mediator, b2CService);

        var result = await handler.Handle(
            new EnsureUserByAuthIdCommand("auth-exists", null, null, null, null),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("auth-exists", result.AuthId);
        // Graph should NOT be called when the user already exists
        Assert.Equal(0, b2CService.CallCount);
    }

    // ────────────────────────────────────────────
    //  EnsureUserByAuthIdHandler — new user, claims present
    // ────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenNewUser_AndClaimsPresent_CreatesUserFromClaims_AndDoesNotCallGraph()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();

        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs.UserProfileDto?>(
            (q, ct) => new GetUserByAzureIdHandler(db.Context).Handle(q, ct));

        var b2CService = new StubB2CUserService();

        var handler = new EnsureUserByAuthIdHandler(db.Context, mediator, b2CService);

        var result = await handler.Handle(
            new EnsureUserByAuthIdCommand("auth-new-claims", "jane@example.com", "Jane", "Jane Doe", "Doe"),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("jane@example.com", result.Email);
        Assert.Equal("Jane", result.FirstName);
        Assert.Equal("Doe", result.LastName);
        // Graph should NOT be called when all claim values are present
        Assert.Equal(0, b2CService.CallCount);
    }

    // ────────────────────────────────────────────
    //  EnsureUserByAuthIdHandler — new user, no claims (production SWA)
    // ────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenNewUser_AndNoClaims_CallsGraph_AndCreatesUserFromGraphData()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();

        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs.UserProfileDto?>(
            (q, ct) => new GetUserByAzureIdHandler(db.Context).Handle(q, ct));

        var b2CService = new StubB2CUserService();
        b2CService.Returns(new B2CUserProfile("b2c@example.com", "B2C", "Person", "B2C Person"));

        var handler = new EnsureUserByAuthIdHandler(db.Context, mediator, b2CService);

        var result = await handler.Handle(
            new EnsureUserByAuthIdCommand("auth-no-claims", null, null, null, null),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("b2c@example.com", result.Email);
        Assert.Equal("B2C", result.FirstName);
        Assert.Equal("Person", result.LastName);
        Assert.Equal(1, b2CService.CallCount);
    }

    [Fact]
    public async Task Handle_WhenNewUser_OnlyEmailMissing_DoesNotCallGraph()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();

        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs.UserProfileDto?>(
            (q, ct) => new GetUserByAzureIdHandler(db.Context).Handle(q, ct));

        var b2CService = new StubB2CUserService();

        var handler = new EnsureUserByAuthIdHandler(db.Context, mediator, b2CService);

        // givenName is present, so Graph should NOT be called
        var result = await handler.Handle(
            new EnsureUserByAuthIdCommand("auth-partial", null, null, "Alice", "Smith"),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Alice", result.FirstName);
        Assert.Equal("Smith", result.LastName);
        Assert.Equal(0, b2CService.CallCount);
    }

    // ────────────────────────────────────────────
    //  EnsureUserByAuthIdHandler — new user, no claims, Graph unavailable
    // ────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenNewUser_AndNoClaims_AndGraphReturnsNull_FallsBackToLocalEmail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        const string authId = "auth-graph-null";

        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs.UserProfileDto?>(
            (q, ct) => new GetUserByAzureIdHandler(db.Context).Handle(q, ct));

        var b2CService = new StubB2CUserService(); // returns null by default

        var handler = new EnsureUserByAuthIdHandler(db.Context, mediator, b2CService);

        var result = await handler.Handle(
            new EnsureUserByAuthIdCommand(authId, null, null, null, null),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal($"{authId}@ourgame.local", result.Email);
        Assert.Equal("User", result.FirstName);
        Assert.Equal(1, b2CService.CallCount);
    }
}
