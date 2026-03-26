using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Clubs.Queries.GetClubById;

namespace OurGame.Application.Tests.Clubs;

public class GetClubByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenClubNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetClubByIdHandler(db.Context);
        var query = new GetClubByIdQuery(Guid.NewGuid());

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenClubExists_ReturnsFullClubDetailDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync("Vale FC");
        var handler = new GetClubByIdHandler(db.Context);
        var query = new GetClubByIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(clubId, result!.Id);
        Assert.Equal("Vale FC", result.Name);
        Assert.Equal("Vale FC", result.ShortName);
        Assert.Equal("#ff0000", result.Colors.Primary);
        Assert.Equal("#ffffff", result.Colors.Secondary);
        Assert.Equal("#000000", result.Colors.Accent);
        Assert.Equal("Stoke", result.Location.City);
        Assert.Equal("GB", result.Location.Country);
        Assert.Equal("Vale Park", result.Location.Venue);
    }

    [Fact]
    public async Task Handle_WhenPrinciplesIsJsonArray_ParsesCorrectly()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync("Vale FC", principles: "[\"Respect\",\"Teamwork\"]");
        var handler = new GetClubByIdHandler(db.Context);
        var query = new GetClubByIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(2, result!.Principles.Count);
        Assert.Contains("Respect", result.Principles);
        Assert.Contains("Teamwork", result.Principles);
    }

    [Fact]
    public async Task Handle_WhenPrinciplesIsDelimited_ParsesCorrectly()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync("Vale FC", principles: "Respect\nTeamwork|Fair Play");
        var handler = new GetClubByIdHandler(db.Context);
        var query = new GetClubByIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(3, result!.Principles.Count);
        Assert.Contains("Respect", result.Principles);
        Assert.Contains("Teamwork", result.Principles);
        Assert.Contains("Fair Play", result.Principles);
    }

    [Fact]
    public async Task Handle_WhenPrinciplesIsEmpty_ReturnsEmptyList()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync("Vale FC", principles: "");
        var handler = new GetClubByIdHandler(db.Context);
        var query = new GetClubByIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result!.Principles);
    }
}
