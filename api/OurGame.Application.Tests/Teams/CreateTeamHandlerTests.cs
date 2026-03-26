using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.CreateTeam;
using OurGame.Application.UseCases.Teams.Commands.CreateTeam.DTOs;

namespace OurGame.Application.Tests.Teams;

public class CreateTeamHandlerTests
{
    [Fact]
    public async Task Handle_WhenClubNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateTeamHandler(db.Context);
        var dto = CreateValidDto(Guid.NewGuid(), Guid.NewGuid());
        var command = new CreateTeamCommand(dto);

        var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.Contains("Club", ex.Message);
    }

    [Fact]
    public async Task Handle_WhenAgeGroupNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new CreateTeamHandler(db.Context);
        var dto = CreateValidDto(clubId, Guid.NewGuid());
        var command = new CreateTeamCommand(dto);

        var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.Contains("AgeGroup", ex.Message);
    }

    [Fact]
    public async Task Handle_WhenAgeGroupBelongsToDifferentClub_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync("Club A");
        var otherClubId = await db.SeedClubAsync("Club B");
        var ageGroupId = await db.SeedAgeGroupAsync(otherClubId);
        var handler = new CreateTeamHandler(db.Context);
        var dto = CreateValidDto(clubId, ageGroupId);
        var command = new CreateTeamCommand(dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("AgeGroupId"));
    }

    [Fact]
    public async Task Handle_WhenAgeGroupIsArchived_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId, isArchived: true);
        var handler = new CreateTeamHandler(db.Context);
        var dto = CreateValidDto(clubId, ageGroupId);
        var command = new CreateTeamCommand(dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("AgeGroupId"));
        Assert.Contains("archived", ex.Errors["AgeGroupId"][0], StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Handle_WhenLevelInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new CreateTeamHandler(db.Context);
        var dto = CreateValidDto(clubId, ageGroupId) with { Level = "invalid" };
        var command = new CreateTeamCommand(dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Level"));
    }

    [Fact]
    public async Task Handle_WhenPrimaryColorInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new CreateTeamHandler(db.Context);
        var dto = CreateValidDto(clubId, ageGroupId) with { PrimaryColor = "red" };
        var command = new CreateTeamCommand(dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("PrimaryColor"));
    }

    [Fact]
    public async Task Handle_WhenSecondaryColorInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new CreateTeamHandler(db.Context);
        var dto = CreateValidDto(clubId, ageGroupId) with { SecondaryColor = "notacolor" };
        var command = new CreateTeamCommand(dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("SecondaryColor"));
    }

    [Fact]
    public async Task Handle_WhenValid_ReturnsCreatedTeamDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new CreateTeamHandler(db.Context);
        var dto = CreateValidDto(clubId, ageGroupId);
        var command = new CreateTeamCommand(dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(clubId, result.ClubId);
        Assert.Equal(ageGroupId, result.AgeGroupId);
        Assert.Equal("Test Team", result.Name);
        Assert.Equal("TT", result.ShortName);
        Assert.Equal("youth", result.Level);
        Assert.Equal("2025-26", result.Season);
        Assert.Equal("#ff0000", result.Colors.Primary);
        Assert.Equal("#ffffff", result.Colors.Secondary);
        Assert.False(result.IsArchived);
    }

    [Fact]
    public async Task Handle_WhenShortNameNull_DefaultsToEmptyString()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new CreateTeamHandler(db.Context);
        var dto = CreateValidDto(clubId, ageGroupId) with { ShortName = null };
        var command = new CreateTeamCommand(dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(string.Empty, result.ShortName);
    }

    [Theory]
    [InlineData("youth", "youth")]
    [InlineData("Youth", "youth")]
    [InlineData("amateur", "amateur")]
    [InlineData("reserve", "reserve")]
    [InlineData("senior", "senior")]
    public async Task Handle_AcceptsAllValidLevels(string input, string expected)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new CreateTeamHandler(db.Context);
        var dto = CreateValidDto(clubId, ageGroupId) with { Level = input };
        var command = new CreateTeamCommand(dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(expected, result.Level);
    }

    private static CreateTeamRequest CreateValidDto(Guid clubId, Guid ageGroupId) =>
        new()
        {
            ClubId = clubId,
            AgeGroupId = ageGroupId,
            Name = "Test Team",
            ShortName = "TT",
            Level = "youth",
            Season = "2025-26",
            PrimaryColor = "#ff0000",
            SecondaryColor = "#ffffff"
        };
}
