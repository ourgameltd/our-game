using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetPlayersByTeamId;

namespace OurGame.Application.Tests.Teams;

public class GetPlayersByTeamIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoPlayers_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new GetPlayersByTeamIdHandler(db.Context);
        var query = new GetPlayersByTeamIdQuery(teamId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsMappedPlayerDtos()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var playerId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Alex", "Vale", 10);
        var handler = new GetPlayersByTeamIdHandler(db.Context);
        var query = new GetPlayersByTeamIdQuery(teamId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        var player = result[0];
        Assert.Equal(playerId, player.Id);
        Assert.Equal("Alex", player.FirstName);
        Assert.Equal("Vale", player.LastName);
        Assert.Equal(10, player.SquadNumber);
    }

    [Fact]
    public async Task Handle_ExcludesArchivedPlayersByDefault()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Active", "Player");

        // Seed archived player in team
        var archivedPlayerId = await db.SeedPlayerAsync(clubId, "Archived", "Player", isArchived: true);
        db.Context.PlayerTeams.Add(new OurGame.Persistence.Models.PlayerTeam
        {
            Id = Guid.NewGuid(),
            PlayerId = archivedPlayerId,
            TeamId = teamId,
            AssignedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayersByTeamIdHandler(db.Context);
        var query = new GetPlayersByTeamIdQuery(teamId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Active", result[0].FirstName);
    }

    [Fact]
    public async Task Handle_IncludesArchivedWhenRequested()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Active", "Player");

        var archivedPlayerId = await db.SeedPlayerAsync(clubId, "Archived", "Player", isArchived: true);
        db.Context.PlayerTeams.Add(new OurGame.Persistence.Models.PlayerTeam
        {
            Id = Guid.NewGuid(),
            PlayerId = archivedPlayerId,
            TeamId = teamId,
            AssignedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayersByTeamIdHandler(db.Context);
        var query = new GetPlayersByTeamIdQuery(teamId, IncludeArchived: true);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.Count);
    }
}
