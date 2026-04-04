using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Queries.GetMyChildren;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Players;

public class GetMyChildrenHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoChildren_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();

        var handler = new GetMyChildrenHandler(db.Context);
        var result = await handler.Handle(new GetMyChildrenQuery("unknown-parent"), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsChildrenForParent()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var parentUserId = await db.SeedUserAsync("parent-auth");
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        db.Context.PlayerParents.Add(new PlayerParent
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            ParentUserId = parentUserId,
            FirstName = "Test",
            LastName = "Parent"
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetMyChildrenHandler(db.Context);
        var result = await handler.Handle(new GetMyChildrenQuery("parent-auth"), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(playerId, result[0].Id);
        Assert.Equal(clubId, result[0].ClubId);
    }

    [Fact]
    public async Task Handle_ExcludesArchivedPlayers()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var parentUserId = await db.SeedUserAsync("parent-auth");
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        // Archive the player
        var player = await db.Context.Players.FindAsync(playerId);
        player!.IsArchived = true;
        await db.Context.SaveChangesAsync();

        db.Context.PlayerParents.Add(new PlayerParent
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            ParentUserId = parentUserId,
            FirstName = "Test",
            LastName = "Parent"
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetMyChildrenHandler(db.Context);
        var result = await handler.Handle(new GetMyChildrenQuery("parent-auth"), CancellationToken.None);

        Assert.Empty(result);
    }
}
