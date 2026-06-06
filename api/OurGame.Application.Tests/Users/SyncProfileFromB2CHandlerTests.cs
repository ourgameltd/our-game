using OurGame.Application.Abstractions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Users.Commands.SyncProfileFromB2C;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;
using Microsoft.Extensions.Logging.Abstractions;

namespace OurGame.Application.Tests.Users;

public class SyncProfileFromB2CHandlerTests
{
    private static SyncProfileFromB2CHandler BuildHandler(
        TestDatabaseFactory db,
        StubB2CUserService b2CService)
    {
        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs.UserProfileDto?>(
            (q, ct) => new GetUserByAzureIdHandler(db.Context).Handle(q, ct));

        return new SyncProfileFromB2CHandler(
            db.Context, mediator, b2CService, NullLogger<SyncProfileFromB2CHandler>.Instance);
    }

    [Fact]
    public async Task Handle_WhenUserNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var b2CService = new StubB2CUserService();
        var handler = BuildHandler(db, b2CService);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new SyncProfileFromB2CCommand("non-existent-auth"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenB2CReturnsNull_ReturnsExistingProfile()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-no-b2c");

        var b2CService = new StubB2CUserService(); // returns null by default
        var handler = BuildHandler(db, b2CService);

        var result = await handler.Handle(new SyncProfileFromB2CCommand("auth-no-b2c"), CancellationToken.None);

        Assert.Equal("Test", result.FirstName);
        Assert.Equal("User", result.LastName);
        Assert.Equal("auth-no-b2c@test.com", result.Email);
    }

    [Fact]
    public async Task Handle_WhenB2CReturnsProfile_UpdatesEmailAndName()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-123");

        var b2CService = new StubB2CUserService();
        b2CService.Returns(new B2CUserProfile("real@example.com", "Jane", "Smith", "Jane Smith"));

        var handler = BuildHandler(db, b2CService);

        var result = await handler.Handle(new SyncProfileFromB2CCommand("auth-123"), CancellationToken.None);

        Assert.Equal("Jane", result.FirstName);
        Assert.Equal("Smith", result.LastName);
        Assert.Equal("real@example.com", result.Email);
    }

    [Fact]
    public async Task Handle_WhenB2CEmailIsNull_KeepsExistingEmail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-456");

        var b2CService = new StubB2CUserService();
        b2CService.Returns(new B2CUserProfile(null, "UpdatedFirst", "UpdatedLast", null));

        var handler = BuildHandler(db, b2CService);

        var result = await handler.Handle(new SyncProfileFromB2CCommand("auth-456"), CancellationToken.None);

        // Email should be unchanged
        Assert.Equal("auth-456@test.com", result.Email);
        // Names should be updated
        Assert.Equal("UpdatedFirst", result.FirstName);
        Assert.Equal("UpdatedLast", result.LastName);
    }

    [Fact]
    public async Task Handle_CallsB2CServiceOnce()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-789");

        var b2CService = new StubB2CUserService();
        b2CService.Returns(new B2CUserProfile("b2c@example.com", "B", "C", null));

        var handler = BuildHandler(db, b2CService);
        await handler.Handle(new SyncProfileFromB2CCommand("auth-789"), CancellationToken.None);

        Assert.Equal(1, b2CService.CallCount);
    }
}
