using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Commands.DeleteClubKit;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Clubs;

public class DeleteClubKitHandlerTests
{
    [Fact]
    public async Task Handle_WhenKitNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new DeleteClubKitHandler(db.Context);
        var command = new DeleteClubKitCommand(clubId, Guid.NewGuid());

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
        var handler = new DeleteClubKitHandler(db.Context);
        var command = new DeleteClubKitCommand(clubId, kitId);

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
        var handler = new DeleteClubKitHandler(db.Context);
        var command = new DeleteClubKitCommand(clubId, kitId);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithValidClubKit_DeletesKit()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var kitId = await db.SeedKitAsync(clubId, null, "Home Kit", KitType.Home);
        var handler = new DeleteClubKitHandler(db.Context);
        var command = new DeleteClubKitCommand(clubId, kitId);

        await handler.Handle(command, CancellationToken.None);

        // Raw SQL delete bypasses EF change tracker, so query directly
        var exists = await db.Context.Kits
            .AsNoTracking()
            .AnyAsync(k => k.Id == kitId);
        Assert.False(exists);
    }
}
