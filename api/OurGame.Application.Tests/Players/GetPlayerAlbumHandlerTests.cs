using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Players.Queries.GetPlayerAlbum;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Players;

public class GetPlayerAlbumHandlerTests
{
    [Fact]
    public async Task Handle_WhenPlayerNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetPlayerAlbumHandler(db.Context);

        var result = await handler.Handle(new GetPlayerAlbumQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenNoImages_ReturnsEmptyPhotos()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, "Alex", "Vale");
        var handler = new GetPlayerAlbumHandler(db.Context);

        var result = await handler.Handle(new GetPlayerAlbumQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(playerId, result!.PlayerId);
        Assert.Equal("Alex Vale", result.PlayerName);
        Assert.Empty(result.Photos);
    }

    [Fact]
    public async Task Handle_ReturnsMappedPhotoDtos()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId, "Alex", "Vale");
        var now = DateTime.UtcNow;

        db.Context.PlayerImages.Add(new PlayerImage
        {
            Id = Guid.NewGuid(),
            PlayerId = playerId,
            Url = "https://example.com/photo1.jpg",
            Caption = "Match day",
            PhotoDate = new DateTime(2025, 3, 15, 0, 0, 0, DateTimeKind.Utc),
            Tags = "match,action",
            CreatedAt = now
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayerAlbumHandler(db.Context);
        var result = await handler.Handle(new GetPlayerAlbumQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result!.Photos);
        var photo = result.Photos[0];
        Assert.Equal("https://example.com/photo1.jpg", photo.Url);
        Assert.Equal("Match day", photo.Caption);
        Assert.Equal("2025-03-15", photo.Date);
        Assert.Equal(2, photo.Tags.Length);
        Assert.Contains("match", photo.Tags);
        Assert.Contains("action", photo.Tags);
    }

    [Fact]
    public async Task Handle_FiltersOutNullUrls()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var playerId = await db.SeedPlayerAsync(clubId);
        var now = DateTime.UtcNow;

        db.Context.PlayerImages.AddRange(
            new PlayerImage { Id = Guid.NewGuid(), PlayerId = playerId, Url = "https://example.com/valid.jpg", CreatedAt = now },
            new PlayerImage { Id = Guid.NewGuid(), PlayerId = playerId, Url = null!, CreatedAt = now },
            new PlayerImage { Id = Guid.NewGuid(), PlayerId = playerId, Url = "", CreatedAt = now }
        );
        await db.Context.SaveChangesAsync();

        var handler = new GetPlayerAlbumHandler(db.Context);
        var result = await handler.Handle(new GetPlayerAlbumQuery(playerId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result!.Photos);
    }
}
