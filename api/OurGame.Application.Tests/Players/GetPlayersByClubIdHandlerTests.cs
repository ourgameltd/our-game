using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId;

namespace OurGame.Application.Tests.Players;

public class GetPlayersByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoPlayers_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetPlayersByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByClubIdQuery(clubId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsPlayersForClub()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        var handler = new GetPlayersByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(playerId, result[0].Id);
        Assert.Equal(clubId, result[0].ClubId);
    }

    [Fact]
    public async Task Handle_ExcludesArchivedByDefault()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var activeId = await db.SeedPlayerAsync(clubId: clubId);

        var archivedId = await db.SeedPlayerAsync(clubId: clubId);
        var archived = await db.Context.Players.FindAsync(archivedId);
        archived!.IsArchived = true;
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayersByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(activeId, result[0].Id);
    }

    [Fact]
    public async Task Handle_IncludesArchivedWhenRequested()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await db.SeedPlayerAsync(clubId: clubId);

        var archivedId = await db.SeedPlayerAsync(clubId: clubId);
        var archived = await db.Context.Players.FindAsync(archivedId);
        archived!.IsArchived = true;
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayersByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByClubIdQuery(clubId, IncludeArchived: true), CancellationToken.None);

        Assert.Equal(2, result.Count);
    }
}
