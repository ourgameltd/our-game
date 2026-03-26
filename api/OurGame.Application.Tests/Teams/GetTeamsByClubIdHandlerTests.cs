using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetTeamsByClubId;

namespace OurGame.Application.Tests.Teams;

public class GetTeamsByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoTeams_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new GetTeamsByClubIdHandler(db.Context);
        var query = new GetTeamsByClubIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsMappedDtos()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new GetTeamsByClubIdHandler(db.Context);
        var query = new GetTeamsByClubIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        var team = result[0];
        Assert.Equal(teamId, team.Id);
        Assert.Equal(clubId, team.ClubId);
        Assert.Equal(ageGroupId, team.AgeGroupId);
        Assert.Equal("U14", team.AgeGroupName);
        Assert.Equal("Blues", team.Name);
        Assert.NotNull(team.Colors);
    }

    [Fact]
    public async Task Handle_ExcludesArchivedByDefault()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        await db.SeedTeamAsync(clubId, ageGroupId, "Active Team");
        await db.SeedTeamAsync(clubId, ageGroupId, "Archived Team", isArchived: true);
        var handler = new GetTeamsByClubIdHandler(db.Context);
        var query = new GetTeamsByClubIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Active Team", result[0].Name);
    }

    [Fact]
    public async Task Handle_IncludesArchivedWhenRequested()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        await db.SeedTeamAsync(clubId, ageGroupId, "Active Team");
        await db.SeedTeamAsync(clubId, ageGroupId, "Archived Team", isArchived: true);
        var handler = new GetTeamsByClubIdHandler(db.Context);
        var query = new GetTeamsByClubIdQuery(clubId, IncludeArchived: true);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task Handle_IncludesPlayerCount()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Player", "One");
        await db.SeedPlayerWithTeamAsync(clubId, teamId, ageGroupId, "Player", "Two");
        var handler = new GetTeamsByClubIdHandler(db.Context);
        var query = new GetTeamsByClubIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result[0].PlayerCount);
    }
}
