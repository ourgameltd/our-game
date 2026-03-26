using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Teams.Queries.GetKitsByTeamId;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Teams;

public class GetKitsByTeamIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenTeamNotFound_ReturnsNotFound()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetKitsByTeamIdHandler(db.Context);
        var query = new GetKitsByTeamIdQuery(Guid.NewGuid());

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.True(result.IsNotFound);
    }

    [Fact]
    public async Task Handle_WhenNoKits_ReturnsEmptyKitsList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var handler = new GetKitsByTeamIdHandler(db.Context);
        var query = new GetKitsByTeamIdQuery(teamId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(teamId, result.Value!.TeamId);
        Assert.Empty(result.Value.Kits);
    }

    [Fact]
    public async Task Handle_ReturnsMappedKitDtos()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        var kitId = await db.SeedKitAsync(clubId, teamId, "Home Kit", KitType.Home);
        var handler = new GetKitsByTeamIdHandler(db.Context);
        var query = new GetKitsByTeamIdQuery(teamId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value!.Kits);
        var kit = result.Value.Kits[0];
        Assert.Equal(kitId, kit.Id);
        Assert.Equal("Home Kit", kit.Name);
        Assert.Equal("home", kit.Type);
        Assert.True(kit.IsActive);
    }

    [Fact]
    public async Task Handle_IncludesTeamAndClubContext()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync("Vale FC");
        var handler = new GetKitsByTeamIdHandler(db.Context);
        var query = new GetKitsByTeamIdQuery(teamId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(teamId, result.Value!.TeamId);
        Assert.Equal("Blues", result.Value.TeamName);
        Assert.Equal(clubId, result.Value.ClubId);
        Assert.Equal("Vale FC", result.Value.ClubName);
    }

    [Theory]
    [InlineData(KitType.Home, "home")]
    [InlineData(KitType.Away, "away")]
    [InlineData(KitType.Third, "third")]
    [InlineData(KitType.Goalkeeper, "goalkeeper")]
    [InlineData(KitType.Training, "training")]
    public async Task Handle_MapsAllKitTypes(KitType type, string expected)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var (clubId, ageGroupId, teamId) = await db.SeedClubWithTeamAsync();
        await db.SeedKitAsync(clubId, teamId, $"{expected} kit", type);
        var handler = new GetKitsByTeamIdHandler(db.Context);
        var query = new GetKitsByTeamIdQuery(teamId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Equal(expected, result.Value!.Kits[0].Type);
    }
}
