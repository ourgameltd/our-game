using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.CreateTeamKit;
using OurGame.Application.UseCases.Teams.Commands.CreateTeamKit.DTOs;

namespace OurGame.Application.Tests.Teams;

public class CreateTeamKitHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateTeamKitHandler(db.Context);
        var command = new CreateTeamKitCommand(Guid.NewGuid(), CreateValidDto());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenTeamArchived_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId, isArchived: true);
        var handler = new CreateTeamKitHandler(db.Context);
        var command = new CreateTeamKitCommand(teamId, CreateValidDto());

        // Handler queries WHERE IsArchived = 0, so archived team is not found
        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNameMissing_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new CreateTeamKitHandler(db.Context);
        var command = new CreateTeamKitCommand(teamId, CreateValidDto() with { Name = "" });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Name"));
    }

    [Fact]
    public async Task Handle_WhenColorInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new CreateTeamKitHandler(db.Context);
        var command = new CreateTeamKitCommand(teamId, CreateValidDto() with { ShirtColor = "red" });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("ShirtColor"));
    }

    [Fact]
    public async Task Handle_WhenTypeInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new CreateTeamKitHandler(db.Context);
        var command = new CreateTeamKitCommand(teamId, CreateValidDto() with { Type = "invalid" });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Type"));
    }

    [Fact]
    public async Task Handle_WhenMultipleFieldsMissing_ThrowsArgumentException_DueToDuplicateKey()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new CreateTeamKitHandler(db.Context);
        var dto = new CreateTeamKitRequestDto
        {
            Name = "",
            Type = "",
            ShirtColor = "",
            ShortsColor = "",
            SocksColor = ""
        };
        var command = new CreateTeamKitCommand(teamId, dto);

        // Known bug: empty Type adds "Type" key for required check, then
        // null kitType tries to add "Type" again, causing ArgumentException
        await Assert.ThrowsAsync<ArgumentException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_ReturnsCreatedKitDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new CreateTeamKitHandler(db.Context);
        var command = new CreateTeamKitCommand(teamId, CreateValidDto());

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal("Home 2025", result.Name);
        Assert.Equal("home", result.Type);
        Assert.Equal("#ff0000", result.ShirtColor);
        Assert.Equal("#ffffff", result.ShortsColor);
        Assert.Equal("#000000", result.SocksColor);
        Assert.Equal("2025-26", result.Season);
        Assert.True(result.IsActive);
    }

    [Theory]
    [InlineData("home", "home")]
    [InlineData("away", "away")]
    [InlineData("third", "third")]
    [InlineData("goalkeeper", "goalkeeper")]
    [InlineData("training", "training")]
    public async Task Handle_AcceptsAllKitTypes(string input, string expected)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new CreateTeamKitHandler(db.Context);
        var dto = CreateValidDto() with { Type = input };
        var command = new CreateTeamKitCommand(teamId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(expected, result.Type);
    }

    private static CreateTeamKitRequestDto CreateValidDto() =>
        new()
        {
            Name = "Home 2025",
            Type = "home",
            ShirtColor = "#ff0000",
            ShortsColor = "#ffffff",
            SocksColor = "#000000",
            Season = "2025-26",
            IsActive = true
        };
}
