using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.AgeGroups.Queries.GetPlayersByAgeGroupId;

namespace OurGame.Application.Tests.AgeGroups;

public class GetPlayersByAgeGroupIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoPlayers_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);

        var handler = new GetPlayersByAgeGroupIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByAgeGroupIdQuery(ageGroupId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsPlayersInAgeGroup()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        db.Context.PlayerAgeGroups.Add(new OurGame.Persistence.Models.PlayerAgeGroup
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            AgeGroupId = ageGroupId
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayersByAgeGroupIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByAgeGroupIdQuery(ageGroupId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(playerId, result[0].Id);
    }

    [Fact]
    public async Task Handle_ExcludesArchivedByDefault()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        var player = await db.Context.Players.FindAsync(playerId);
        player!.IsArchived = true;
        await db.Context.SaveChangesAsync();

        db.Context.PlayerAgeGroups.Add(new OurGame.Persistence.Models.PlayerAgeGroup
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            AgeGroupId = ageGroupId
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayersByAgeGroupIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByAgeGroupIdQuery(ageGroupId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_IncludesArchivedWhenRequested()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        var player = await db.Context.Players.FindAsync(playerId);
        player!.IsArchived = true;
        await db.Context.SaveChangesAsync();

        db.Context.PlayerAgeGroups.Add(new OurGame.Persistence.Models.PlayerAgeGroup
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            AgeGroupId = ageGroupId
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayersByAgeGroupIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByAgeGroupIdQuery(ageGroupId, IncludeArchived: true), CancellationToken.None);

        Assert.Single(result);
    }
}
