using Microsoft.EntityFrameworkCore;
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

    [Fact]
    public async Task Handle_ReturnsOnlyPublicMediaLinks()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync("Vale FC");

        await db.Context.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO ClubMediaLinks
            (Id, ClubId, Url, Title, Type, IsPublic, DisplayOrder, CreatedAt, UpdatedAt)
            VALUES
            ({Guid.NewGuid()}, {clubId}, {"https://example.com/public"}, {"Public link"}, {"website"}, {true}, {0}, {DateTime.UtcNow}, {DateTime.UtcNow}),
            ({Guid.NewGuid()}, {clubId}, {"https://example.com/private"}, {"Private link"}, {"website"}, {false}, {1}, {DateTime.UtcNow}, {DateTime.UtcNow})
        ");

        var handler = new GetClubByIdHandler(db.Context);
        var query = new GetClubByIdQuery(clubId);

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result!.MediaLinks);
        Assert.Equal("https://example.com/public", result.MediaLinks[0].Url);
        Assert.True(result.MediaLinks[0].IsPublic);
    }
}
