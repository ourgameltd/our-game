using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Coaches.Queries.GetCoachesByClubId;

namespace OurGame.Application.Tests.Coaches;

public class GetCoachesByClubIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoCoaches_ReturnsEmptyPagedResult()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();

        var handler = new GetCoachesByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByClubIdQuery(clubId), CancellationToken.None);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
    }

    [Fact]
    public async Task Handle_ReturnsCoachesForClub()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId, firstName: "Jane", lastName: "Smith");

        var handler = new GetCoachesByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByClubIdQuery(clubId), CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal(coachId, result.Items[0].Id);
        Assert.Equal("Jane", result.Items[0].FirstName);
        Assert.Equal(1, result.TotalCount);
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

        Assert.Single(result.Items);
        Assert.False(result.Items[0].IsArchived);
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

        Assert.Equal(2, result.TotalCount);
    }

    [Fact]
    public async Task Handle_FiltersCoachesByName()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await db.SeedCoachAsync(clubId: clubId, authId: "coach-1", firstName: "Alice", lastName: "Brown");
        await db.SeedCoachAsync(clubId: clubId, authId: "coach-2", firstName: "Bob", lastName: "Green");

        var handler = new GetCoachesByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByClubIdQuery(clubId, Search: "Alice"), CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal("Alice", result.Items[0].FirstName);
    }

    [Fact]
    public async Task Handle_PaginatesResults()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        for (var i = 1; i <= 5; i++)
            await db.SeedCoachAsync(clubId: clubId, authId: $"coach-{i}", firstName: $"Coach{i:D2}", lastName: "Vale");

        var handler = new GetCoachesByClubIdHandler(db.Context);
        var page1 = await handler.Handle(new GetCoachesByClubIdQuery(clubId, Page: 1, PageSize: 2), CancellationToken.None);
        var page2 = await handler.Handle(new GetCoachesByClubIdQuery(clubId, Page: 2, PageSize: 2), CancellationToken.None);

        Assert.Equal(5, page1.TotalCount);
        Assert.Equal(2, page1.Items.Count);
        Assert.Equal(2, page2.Items.Count);
        Assert.True(page1.HasNextPage);
        Assert.False(page1.HasPreviousPage);
        Assert.True(page2.HasPreviousPage);
    }

    [Fact]
    public async Task Handle_FiltersCoachesByRole()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        await db.SeedCoachAsync(clubId: clubId, authId: "coach-head", firstName: "Head", lastName: "Coach", clubRoles: "Head Coach");
        await db.SeedCoachAsync(clubId: clubId, authId: "coach-asst", firstName: "Asst", lastName: "Coach", clubRoles: "Assistant Coach");

        var handler = new GetCoachesByClubIdHandler(db.Context);
        var result = await handler.Handle(new GetCoachesByClubIdQuery(clubId, Role: "Head Coach"), CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal("Head", result.Items[0].FirstName);
    }
}
