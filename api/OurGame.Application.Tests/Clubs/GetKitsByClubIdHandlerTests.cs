using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Queries.GetKitsByClubId;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.Clubs;

public class GetKitsByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoKits_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var handler = new GetKitsByClubIdHandler(db.Context);
        var query = new GetKitsByClubIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_WhenClubKitsExist_ReturnsMappedDtos()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await db.SeedKitAsync(clubId, null, "Home Kit", KitType.Home);
        await db.SeedKitAsync(clubId, null, "Away Kit", KitType.Away);
        var handler = new GetKitsByClubIdHandler(db.Context);
        var query = new GetKitsByClubIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.Count);
        Assert.Contains(result, k => k.Name == "Home Kit" && k.Type == "home");
        Assert.Contains(result, k => k.Name == "Away Kit" && k.Type == "away");
    }

    [Fact]
    public async Task Handle_ExcludesTeamKits()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var teamId = await db.SeedTeamAsync(clubId, ageGroupId);
        await db.SeedKitAsync(clubId, null, "Club Kit", KitType.Home);
        await db.SeedKitAsync(clubId, teamId, "Team Kit", KitType.Home);
        var handler = new GetKitsByClubIdHandler(db.Context);
        var query = new GetKitsByClubIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("Club Kit", result[0].Name);
    }

    [Theory]
    [InlineData(KitType.Home, "home")]
    [InlineData(KitType.Away, "away")]
    [InlineData(KitType.Third, "third")]
    [InlineData(KitType.Goalkeeper, "goalkeeper")]
    [InlineData(KitType.Training, "training")]
    public async Task Handle_MapsKitTypeCorrectly(KitType kitType, string expectedTypeString)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await db.SeedKitAsync(clubId, null, "Kit", kitType);
        var handler = new GetKitsByClubIdHandler(db.Context);
        var query = new GetKitsByClubIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(expectedTypeString, result[0].Type);
    }
}
