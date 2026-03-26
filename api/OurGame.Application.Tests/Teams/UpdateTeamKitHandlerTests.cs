using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamKit;
using OurGame.Application.UseCases.Teams.Commands.UpdateTeamKit.DTOs;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class UpdateTeamKitHandlerTests
{
    [Fact]
    public async Task Handle_WhenKitNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new UpdateTeamKitHandler(db.Context);
        var command = new UpdateTeamKitCommand(teamId, Guid.NewGuid(), CreateValidDto());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenKitBelongsToDifferentTeam_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var otherTeamId = await db.SeedTeamAsync(clubId, ageGroupId, "Other Team");
        var kitId = await db.SeedKitAsync(clubId, otherTeamId);
        var handler = new UpdateTeamKitHandler(db.Context);
        var command = new UpdateTeamKitCommand(teamId, kitId, CreateValidDto());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNameMissing_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var kitId = await db.SeedKitAsync(clubId, teamId);
        var handler = new UpdateTeamKitHandler(db.Context);
        var command = new UpdateTeamKitCommand(teamId, kitId, CreateValidDto() with { Name = "" });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Name"));
    }

    [Fact]
    public async Task Handle_WhenColorInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var kitId = await db.SeedKitAsync(clubId, teamId);
        var handler = new UpdateTeamKitHandler(db.Context);
        var command = new UpdateTeamKitCommand(teamId, kitId, CreateValidDto() with { ShirtColor = "nothex" });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("ShirtColor"));
    }

    [Fact]
    public async Task Handle_WhenTypeInvalid_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var kitId = await db.SeedKitAsync(clubId, teamId);
        var handler = new UpdateTeamKitHandler(db.Context);
        var command = new UpdateTeamKitCommand(teamId, kitId, CreateValidDto() with { Type = "invalid" });

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Type"));
    }

    [Fact]
    public async Task Handle_WhenValid_ReturnsUpdatedKitDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var kitId = await db.SeedKitAsync(clubId, teamId);
        var handler = new UpdateTeamKitHandler(db.Context);
        var dto = new UpdateTeamKitRequestDto
        {
            Name = "Away 2026",
            Type = "away",
            ShirtColor = "#0000ff",
            ShortsColor = "#ffffff",
            SocksColor = "#0000ff",
            Season = "2026-27",
            IsActive = false
        };
        var command = new UpdateTeamKitCommand(teamId, kitId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(kitId, result.Id);
        Assert.Equal("Away 2026", result.Name);
        Assert.Equal("away", result.Type);
        Assert.Equal("#0000ff", result.ShirtColor);
        Assert.Equal("#ffffff", result.ShortsColor);
        Assert.Equal("#0000ff", result.SocksColor);
        Assert.Equal("2026-27", result.Season);
        Assert.False(result.IsActive);
    }

    private static UpdateTeamKitRequestDto CreateValidDto() =>
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
