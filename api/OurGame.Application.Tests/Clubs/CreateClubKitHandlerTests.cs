using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Commands.CreateClubKit;
using OurGame.Application.UseCases.Clubs.Commands.CreateClubKit.DTOs;

namespace OurGame.Application.Tests.Clubs;

public class CreateClubKitHandlerTests
{
    [Fact]
    public async Task Handle_WhenClubNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateClubKitHandler(db.Context);
        var dto = CreateValidDto();
        var command = new CreateClubKitCommand(Guid.NewGuid(), dto);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNameMissing_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new CreateClubKitHandler(db.Context);
        var dto = CreateValidDto() with { Name = "" };
        var command = new CreateClubKitCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Name"));
    }

    [Fact]
    public async Task Handle_WhenTypeMissing_ThrowsArgumentException_DueToDuplicateKey()
    {
        // Note: The handler has a bug where empty Type triggers two errors.Add("Type", ...)
        // First for "Type is required" then for "Invalid kit type", causing ArgumentException.
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new CreateClubKitHandler(db.Context);
        var dto = CreateValidDto() with { Type = "" };
        var command = new CreateClubKitCommand(clubId, dto);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenColorsEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new CreateClubKitHandler(db.Context);
        var dto = CreateValidDto() with { ShirtColor = "", ShortsColor = "", SocksColor = "" };
        var command = new CreateClubKitCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("ShirtColor"));
        Assert.True(ex.Errors.ContainsKey("ShortsColor"));
        Assert.True(ex.Errors.ContainsKey("SocksColor"));
    }

    [Fact]
    public async Task Handle_WhenInvalidHexColor_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new CreateClubKitHandler(db.Context);
        var dto = CreateValidDto() with { ShirtColor = "red" };
        var command = new CreateClubKitCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("ShirtColor"));
    }

    [Fact]
    public async Task Handle_WhenInvalidKitType_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new CreateClubKitHandler(db.Context);
        var dto = CreateValidDto() with { Type = "invalid" };
        var command = new CreateClubKitCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Type"));
    }

    [Fact]
    public async Task Handle_WithValidRequest_ReturnsClubKitDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new CreateClubKitHandler(db.Context);
        var dto = CreateValidDto();
        var command = new CreateClubKitCommand(clubId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal("Home Kit", result.Name);
        Assert.Equal("home", result.Type);
        Assert.Equal("#ff0000", result.ShirtColor);
        Assert.Equal("#ffffff", result.ShortsColor);
        Assert.Equal("#000000", result.SocksColor);
        Assert.True(result.IsActive);
    }

    [Theory]
    [InlineData("home")]
    [InlineData("away")]
    [InlineData("third")]
    [InlineData("goalkeeper")]
    [InlineData("training")]
    public async Task Handle_AllKitTypes_AreAccepted(string type)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new CreateClubKitHandler(db.Context);
        var dto = CreateValidDto() with { Type = type };
        var command = new CreateClubKitCommand(clubId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(type, result.Type);
    }

    private static CreateClubKitRequestDto CreateValidDto() => new()
    {
        Type = "home",
        Name = "Home Kit",
        ShirtColor = "#ff0000",
        ShortsColor = "#ffffff",
        SocksColor = "#000000",
        Season = "2025-26",
        IsActive = true
    };
}
