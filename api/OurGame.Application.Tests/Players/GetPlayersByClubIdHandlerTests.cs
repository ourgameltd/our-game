using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Queries.GetPlayersByClubId;

namespace OurGame.Application.Tests.Players;

public class GetPlayersByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoPlayers_ReturnsEmptyPagedResult()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetPlayersByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByClubIdQuery(clubId), CancellationToken.None);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
    }

    [Fact]
    public async Task Handle_ReturnsPlayersForClub()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId: clubId);

        var handler = new GetPlayersByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal(playerId, result.Items[0].Id);
        Assert.Equal(clubId, result.Items[0].ClubId);
        Assert.Equal(1, result.TotalCount);
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

        Assert.Single(result.Items);
        Assert.Equal(activeId, result.Items[0].Id);
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

        Assert.Equal(2, result.TotalCount);
        Assert.Equal(2, result.Items.Count);
    }

    [Fact]
    public async Task Handle_ReturnsCorrectPage_WhenPageAndPageSizeSet()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        // Seed 3 players whose names sort as Alpha, Beta, Gamma
        await db.SeedPlayerAsync(clubId: clubId, firstName: "Alpha");
        await db.SeedPlayerAsync(clubId: clubId, firstName: "Beta");
        await db.SeedPlayerAsync(clubId: clubId, firstName: "Gamma");

        var handler = new GetPlayersByClubIdHandler(db.Context);

        var page1 = await handler.Handle(new GetPlayersByClubIdQuery(clubId, Page: 1, PageSize: 2), CancellationToken.None);
        var page2 = await handler.Handle(new GetPlayersByClubIdQuery(clubId, Page: 2, PageSize: 2), CancellationToken.None);

        Assert.Equal(3, page1.TotalCount);
        Assert.Equal(2, page1.Items.Count);
        Assert.Single(page2.Items);
        Assert.True(page1.HasNextPage);
        Assert.False(page1.HasPreviousPage);
        Assert.False(page2.HasNextPage);
        Assert.True(page2.HasPreviousPage);
        Assert.Equal("Alpha", page1.Items[0].FirstName);
        Assert.Equal("Beta", page1.Items[1].FirstName);
        Assert.Equal("Gamma", page2.Items[0].FirstName);
    }

    [Fact]
    public async Task Handle_FiltersPlayersBySearch()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var targetId = await db.SeedPlayerAsync(clubId: clubId, firstName: "Jordan");
        await db.SeedPlayerAsync(clubId: clubId, firstName: "Chris");

        var handler = new GetPlayersByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetPlayersByClubIdQuery(clubId, Search: "Jord"), CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal(targetId, result.Items[0].Id);
    }

    [Fact]
    public async Task Handle_FiltersPlayersByAgeGroup()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var inGroupId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "InGroup");
        await db.SeedPlayerAsync(clubId: clubId, firstName: "NoGroup");

        var handler = new GetPlayersByClubIdHandler(db.Context);
        var result = await handler.Handle(
            new GetPlayersByClubIdQuery(clubId, AgeGroupId: ageGroupId), CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal(inGroupId, result.Items[0].Id);
    }

    [Fact]
    public async Task Handle_FiltersPlayersByTeam()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var inTeamId = await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "InTeam");
        await db.SeedPlayerAsync(clubId: clubId, firstName: "NoTeam");

        var handler = new GetPlayersByClubIdHandler(db.Context);
        var result = await handler.Handle(
            new GetPlayersByClubIdQuery(clubId, TeamId: teamId), CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal(inTeamId, result.Items[0].Id);
    }
}
