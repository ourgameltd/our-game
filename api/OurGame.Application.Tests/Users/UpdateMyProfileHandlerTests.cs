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

        var handler = new UpdateMyProfileHandler(db.Context, mediator);
        var command = new UpdateMyProfileCommand("non-existent-auth", new UpdateMyProfileRequestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com"
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

        var handler = new UpdateMyProfileHandler(db.Context, mediator);
        var command = new UpdateMyProfileCommand("auth-123", new UpdateMyProfileRequestDto
        {
            FirstName = "  ",
            LastName = "Doe",
            Email = "john@example.com"
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

        var handler = new UpdateMyProfileHandler(db.Context, mediator);
        var command = new UpdateMyProfileCommand("auth-123", new UpdateMyProfileRequestDto
        {
            FirstName = "John",
            LastName = "",
            Email = "john@example.com"
        });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));
        Assert.Contains("LastName", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenEmailEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-123");
        var mediator = new TestMediator();

        var handler = new UpdateMyProfileHandler(db.Context, mediator);
        var command = new UpdateMyProfileCommand("auth-123", new UpdateMyProfileRequestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = ""
        });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));
        Assert.Contains("Email", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenEmailInvalidFormat_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-123");
        var mediator = new TestMediator();

        var handler = new UpdateMyProfileHandler(db.Context, mediator);
        var command = new UpdateMyProfileCommand("auth-123", new UpdateMyProfileRequestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "not-an-email"
        });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));
        Assert.Contains("Email", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenEmailAlreadyInUse_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-1");
        // Seed a second user with a different email
        var userId2 = Guid.NewGuid();
        db.Context.Users.Add(new OurGame.Persistence.Models.User
        {
            Id = userId2,
            AuthId = "auth-2",
            Email = "taken@example.com",
            FirstName = "Other",
            LastName = "User",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var mediator = new TestMediator();
        var handler = new UpdateMyProfileHandler(db.Context, mediator);
        var command = new UpdateMyProfileCommand("auth-1", new UpdateMyProfileRequestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "taken@example.com"
        });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));
        Assert.Contains("Email", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesAndReturnsProfile()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-123");

        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs.UserProfileDto?>(
            (q, ct) => new GetUserByAzureIdHandler(db.Context).Handle(q, ct));

        var handler = new UpdateMyProfileHandler(db.Context, mediator);
        var command = new UpdateMyProfileCommand("auth-123", new UpdateMyProfileRequestDto
        {
            FirstName = "Updated",
            LastName = "Name",
            Email = "updated@example.com"
        });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Updated", result.FirstName);
        Assert.Equal("Name", result.LastName);
        Assert.Equal("updated@example.com", result.Email);
    }

    [Fact]
    public async Task Handle_EmailNormalizedToLowerCase()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        await db.SeedUserAsync("auth-123");

        var mediator = new TestMediator();
        mediator.Register<GetUserByAzureIdQuery, OurGame.Application.UseCases.Users.Queries.GetUserByAzureId.DTOs.UserProfileDto?>(
            (q, ct) => new GetUserByAzureIdHandler(db.Context).Handle(q, ct));

        var handler = new UpdateMyProfileHandler(db.Context, mediator);
        var command = new UpdateMyProfileCommand("auth-123", new UpdateMyProfileRequestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "MIXED.CASE@Example.COM"
        });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("mixed.case@example.com", result.Email);
    }
}
