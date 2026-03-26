using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId;

namespace OurGame.Application.Tests.Coaches;

public class GetCoachesByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoCoaches_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetCoachesByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByClubIdQuery(clubId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsCoachesForClub()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId, firstName: "Jane", lastName: "Smith");

        var handler = new GetCoachesByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(coachId, result[0].Id);
        Assert.Equal("Jane", result[0].FirstName);
    }

    [Fact]
    public async Task Handle_ExcludesArchivedByDefault()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await db.SeedCoachAsync(clubId: clubId, authId: "active-coach");
        await db.SeedCoachAsync(clubId: clubId, authId: "archived-coach", isArchived: true);

        var handler = new GetCoachesByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result);
        Assert.False(result[0].IsArchived);
    }

    [Fact]
    public async Task Handle_IncludesArchivedWhenRequested()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await db.SeedCoachAsync(clubId: clubId, authId: "active-coach");
        await db.SeedCoachAsync(clubId: clubId, authId: "archived-coach", isArchived: true);

        var handler = new GetCoachesByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByClubIdQuery(clubId, IncludeArchived: true), CancellationToken.None);

        Assert.Equal(2, result.Count);
    }
}
