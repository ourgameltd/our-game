using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubById;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubById.DTOs;

namespace OurGame.Application.Tests.Clubs;

public class UpdateClubHandlerTests
{
    [Fact]
    public async Task Handle_WhenClubNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto();
        var command = new UpdateClubCommand(Guid.NewGuid(), dto);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNameMissing_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with { Name = "" };
        var command = new UpdateClubCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Name"));
    }

    [Fact]
    public async Task Handle_WhenMultipleFieldsMissing_ThrowsValidationExceptionWithAllErrors()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with { Name = "", ShortName = "", City = "", Country = "", Venue = "" };
        var command = new UpdateClubCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.Equal(5, ex.Errors.Count);
        Assert.True(ex.Errors.ContainsKey("Name"));
        Assert.True(ex.Errors.ContainsKey("ShortName"));
        Assert.True(ex.Errors.ContainsKey("City"));
        Assert.True(ex.Errors.ContainsKey("Country"));
        Assert.True(ex.Errors.ContainsKey("Venue"));
    }

    [Fact]
    public async Task Handle_WhenFoundedYearTooLow_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with { Founded = 1800 };
        var command = new UpdateClubCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Founded"));
    }

    [Fact]
    public async Task Handle_WhenFoundedYearTooHigh_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with { Founded = DateTime.UtcNow.Year + 1 };
        var command = new UpdateClubCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Founded"));
    }

    [Fact]
    public async Task Handle_WhenInvalidHexColor_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with { PrimaryColor = "red" };
        var command = new UpdateClubCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("PrimaryColor"));
    }

    [Fact]
    public async Task Handle_WhenInvalidSecondaryColor_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with { SecondaryColor = "nope" };
        var command = new UpdateClubCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("SecondaryColor"));
    }

    [Fact]
    public async Task Handle_WhenInvalidAccentColor_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with { AccentColor = "#GGG" };
        var command = new UpdateClubCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("AccentColor"));
    }

    [Fact]
    public async Task Handle_WithValidRequest_ReturnsUpdatedClubDetailDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with
        {
            Name = "New Name",
            ShortName = "NN",
            PrimaryColor = "#112233",
            SecondaryColor = "#445566",
            AccentColor = "#778899",
            City = "London",
            Country = "UK",
            Venue = "Wembley",
            Address = "123 Stadium Way",
            Founded = 1900,
            History = "Great history",
            Ethos = "Community club",
            Principles = new[] { "Respect", "Teamwork" }
        };
        var command = new UpdateClubCommand(clubId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(clubId, result.Id);
        Assert.Equal("New Name", result.Name);
        Assert.Equal("NN", result.ShortName);
        Assert.Equal("#112233", result.Colors.Primary);
        Assert.Equal("#445566", result.Colors.Secondary);
        Assert.Equal("#778899", result.Colors.Accent);
        Assert.Equal("London", result.Location.City);
        Assert.Equal("UK", result.Location.Country);
        Assert.Equal("Wembley", result.Location.Venue);
        Assert.Equal("123 Stadium Way", result.Location.Address);
        Assert.Equal(1900, result.Founded);
        Assert.Equal("Great history", result.History);
        Assert.Equal("Community club", result.Ethos);
        Assert.Equal(2, result.Principles.Count);
        Assert.Contains("Respect", result.Principles);
        Assert.Contains("Teamwork", result.Principles);
    }

    [Fact]
    public async Task Handle_WithNullPrinciples_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with { Principles = null };
        var command = new UpdateClubCommand(clubId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Empty(result.Principles);
    }

    [Fact]
    public async Task Handle_WithEmptyPrinciples_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with { Principles = Array.Empty<string>() };
        var command = new UpdateClubCommand(clubId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Empty(result.Principles);
    }

    [Fact]
    public async Task Handle_WithNullAddress_UsesEmptyString()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with { Address = null };
        var command = new UpdateClubCommand(clubId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(string.Empty, result.Location.Address);
    }

    [Fact]
    public async Task Handle_WithInvalidMediaLinkUrl_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with
        {
            MediaLinks = new List<UpdateClubMediaLinkDto>
            {
                new() { Url = "not-a-url", Type = "website", IsPublic = true }
            }
        };
        var command = new UpdateClubCommand(clubId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("MediaLinks[0].Url"));
    }

    [Fact]
    public async Task Handle_WithValidMediaLinks_ReturnsUpdatedMediaLinks()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubHandler(db.Context);
        var dto = CreateValidDto() with
        {
            MediaLinks = new List<UpdateClubMediaLinkDto>
            {
                new() { Url = "https://example.com/report", Title = "Match report", Type = "match-report", IsPublic = true },
                new() { Url = "https://example.com/private", Title = "Private sponsor file", Type = "sponsor", IsPublic = false }
            }
        };
        var command = new UpdateClubCommand(clubId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(2, result.MediaLinks.Count);
        Assert.Contains(result.MediaLinks, link => link.Url == "https://example.com/report" && link.IsPublic);
        Assert.Contains(result.MediaLinks, link => link.Url == "https://example.com/private" && !link.IsPublic);
    }

    private static UpdateClubRequestDto CreateValidDto() => new()
    {
        Name = "Vale FC",
        ShortName = "VFC",
        PrimaryColor = "#ff0000",
        SecondaryColor = "#ffffff",
        AccentColor = "#000000",
        City = "Stoke",
        Country = "GB",
        Venue = "Vale Park"
    };
}
