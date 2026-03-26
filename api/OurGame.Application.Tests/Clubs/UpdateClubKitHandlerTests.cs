using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubKit;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubKit.DTOs;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Clubs;

public class UpdateClubKitHandlerTests
{
    [Fact]
    public async Task Handle_WhenKitNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new UpdateClubKitHandler(db.Context);
        var dto = CreateValidDto();
        var command = new UpdateClubKitCommand(clubId, Guid.NewGuid(), dto);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenKitBelongsToDifferentClub_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var otherClubId = await db.SeedClubAsync("Other Club");
        var kitId = await db.SeedKitAsync(otherClubId, null, "Away Kit", KitType.Away);
        var handler = new UpdateClubKitHandler(db.Context);
        var dto = CreateValidDto();
        var command = new UpdateClubKitCommand(clubId, kitId, dto);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenKitIsTeamKit_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId);
        var kitId = await db.SeedKitAsync(clubId, teamId, "Team Kit", KitType.Home);
        var handler = new UpdateClubKitHandler(db.Context);
        var dto = CreateValidDto();
        var command = new UpdateClubKitCommand(clubId, kitId, dto);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenNameMissing_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var kitId = await db.SeedKitAsync(clubId, null, "Home Kit", KitType.Home);
        var handler = new UpdateClubKitHandler(db.Context);
        var dto = CreateValidDto() with { Name = "" };
        var command = new UpdateClubKitCommand(clubId, kitId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Name"));
    }

    [Fact]
    public async Task Handle_WhenInvalidHexColor_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var kitId = await db.SeedKitAsync(clubId, null, "Home Kit", KitType.Home);
        var handler = new UpdateClubKitHandler(db.Context);
        var dto = CreateValidDto() with { ShirtColor = "invalid" };
        var command = new UpdateClubKitCommand(clubId, kitId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("ShirtColor"));
    }

    [Fact]
    public async Task Handle_WhenInvalidKitType_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var kitId = await db.SeedKitAsync(clubId, null, "Home Kit", KitType.Home);
        var handler = new UpdateClubKitHandler(db.Context);
        var dto = CreateValidDto() with { Type = "invalid" };
        var command = new UpdateClubKitCommand(clubId, kitId, dto);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.True(ex.Errors.ContainsKey("Type"));
    }

    [Fact]
    public async Task Handle_WithValidRequest_ReturnsUpdatedClubKitDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var kitId = await db.SeedKitAsync(clubId, null, "Old Kit", KitType.Home);
        var handler = new UpdateClubKitHandler(db.Context);
        var dto = CreateValidDto() with { Name = "Updated Kit", Type = "away" };
        var command = new UpdateClubKitCommand(clubId, kitId, dto);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.Equal(kitId, result.Id);
        Assert.Equal("Updated Kit", result.Name);
        Assert.Equal("away", result.Type);
        Assert.Equal("#112233", result.ShirtColor);
        Assert.Equal("#445566", result.ShortsColor);
        Assert.Equal("#778899", result.SocksColor);
        Assert.True(result.IsActive);
    }

    private static UpdateClubKitRequestDto CreateValidDto() => new()
    {
        Type = "home",
        Name = "Home Kit",
        ShirtColor = "#112233",
        ShortsColor = "#445566",
        SocksColor = "#778899",
        Season = "2025-26",
        IsActive = true
    };
}
