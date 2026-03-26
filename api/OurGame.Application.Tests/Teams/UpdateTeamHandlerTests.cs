using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeam;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeam.DTOs;

namespace OurGame.Application.Tests.Teams;

public class UpdateTeamHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateTeamHandler(db.Context);
        var command = new UpdateTeamCommand(Guid.NewGuid(), CreateValidDto());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenTeamArchived_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId, isArchived: true);
        var handler = new UpdateTeamHandler(db.Context);
        var command = new UpdateTeamCommand(teamId, CreateValidDto());

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Team"));
        Assert.Contains("archived", ex.Errors["Team"][0], StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Handle_WhenLevelInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new UpdateTeamHandler(db.Context);
        var command = new UpdateTeamCommand(teamId, CreateValidDto() with { Level = "invalid" });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Level"));
    }

    [Fact]
    public async Task Handle_WhenPrimaryColorInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new UpdateTeamHandler(db.Context);
        var command = new UpdateTeamCommand(teamId, CreateValidDto() with { PrimaryColor = "nope" });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("PrimaryColor"));
    }

    [Fact]
    public async Task Handle_WhenSecondaryColorInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new UpdateTeamHandler(db.Context);
        var command = new UpdateTeamCommand(teamId, CreateValidDto() with { SecondaryColor = "bad" });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("SecondaryColor"));
    }

    [Fact]
    public async Task Handle_WhenValid_ReturnsUpdatedTeamDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new UpdateTeamHandler(db.Context);
        var dto = new UpdateTeamRequestDto
        {
            Name = "Updated Team",
            ShortName = "UT",
            Level = "senior",
            Season = "2026-27",
            PrimaryColor = "#00ff00",
            SecondaryColor = "#0000ff"
        };
        var command = new UpdateTeamCommand(teamId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(teamId, result.Id);
        Assert.Equal(clubId, result.ClubId);
        Assert.Equal(ageGroupId, result.AgeGroupId);
        Assert.Equal("Updated Team", result.Name);
        Assert.Equal("UT", result.ShortName);
        Assert.Equal("senior", result.Level);
        Assert.Equal("2026-27", result.Season);
        Assert.Equal("#00ff00", result.Colors.Primary);
        Assert.Equal("#0000ff", result.Colors.Secondary);
        Assert.False(result.IsArchived);
    }

    [Fact]
    public async Task Handle_WhenShortNameNull_DefaultsToEmptyString()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new UpdateTeamHandler(db.Context);
        var command = new UpdateTeamCommand(teamId, CreateValidDto() with { ShortName = null });

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(string.Empty, result.ShortName);
    }

    private static UpdateTeamRequestDto CreateValidDto() =>
        new()
        {
            Name = "Test Team",
            ShortName = "TT",
            Level = "youth",
            Season = "2025-26",
            PrimaryColor = "#ff0000",
            SecondaryColor = "#ffffff"
        };
}
