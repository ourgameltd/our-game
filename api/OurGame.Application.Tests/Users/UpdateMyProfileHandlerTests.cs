using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Users.Commands.UpdateMyProfile;
using OurGame.Application.UseCases.Users.Commands.UpdateMyProfile.DTOs;
using OurGame.Application.UseCases.Users.Queries.GetUserByAzureId;

namespace OurGame.Application.Tests.Users;

public class UpdateMyProfileHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs.UserProfileDto?>(
            (q, ct) => new GetUserByAzureIdHandler(db.Context).Handle(q, ct));

        var handler = new UpdateMyProfileHandler(db.Context, mediator, new StubBlobStorageService());
        var command = new UpdateMyProfileCommand("non-existent-auth", new UpdateMyProfileRequestDto
        {
            FirstName = "John",
            LastName = "Doe"
        });

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenFirstNameEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-123");
        var mediator = new TestMediator();

        var handler = new UpdateMyProfileHandler(db.Context, mediator, new StubBlobStorageService());
        var command = new UpdateMyProfileCommand("auth-123", new UpdateMyProfileRequestDto
        {
            FirstName = "  ",
            LastName = "Doe"
        });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));
        Assert.Contains("FirstName", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenLastNameEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-123");
        var mediator = new TestMediator();

        var handler = new UpdateMyProfileHandler(db.Context, mediator, new StubBlobStorageService());
        var command = new UpdateMyProfileCommand("auth-123", new UpdateMyProfileRequestDto
        {
            FirstName = "John",
            LastName = ""
        });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));
        Assert.Contains("LastName", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesAndReturnsProfile()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-123");

        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs.UserProfileDto?>(
            (q, ct) => new GetUserByAzureIdHandler(db.Context).Handle(q, ct));

        var handler = new UpdateMyProfileHandler(db.Context, mediator, new StubBlobStorageService());
        var command = new UpdateMyProfileCommand("auth-123", new UpdateMyProfileRequestDto
        {
            FirstName = "Updated",
            LastName = "Name"
        });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Updated", result.FirstName);
        Assert.Equal("Name", result.LastName);
    }
}
