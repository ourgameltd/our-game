using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Commands.DeleteTeamKit;

namespace OurGame.Application.Tests.Teams;

public class DeleteTeamKitHandlerTests
{
    [Fact]
    public async Task Handle_WhenKitNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new DeleteTeamKitHandler(db.Context);
        var command = new DeleteTeamKitCommand(teamId, Guid.NewGuid());

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
        var handler = new DeleteTeamKitHandler(db.Context);
        var command = new DeleteTeamKitCommand(teamId, kitId);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenValid_DeletesKit()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var kitId = await db.SeedKitAsync(clubId, teamId);
        var handler = new DeleteTeamKitHandler(db.Context);
        var command = new DeleteTeamKitCommand(teamId, kitId);

        await handler.Handle(command, CancellationToken.None);

        // Use AsNoTracking because raw SQL DELETE bypasses EF change tracker
        var kit = await db.Context.Kits.AsNoTracking().FirstOrDefaultAsync(k => k.Id == kitId);
        Assert.Null(kit);
    }
}
