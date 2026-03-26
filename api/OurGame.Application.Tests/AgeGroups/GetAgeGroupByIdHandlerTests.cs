using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.AgeGroups;

public class GetAgeGroupByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetAgeGroupByIdHandler(db.Context);

        var result = await handler.Handle(new GetAgeGroupByIdQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_ReturnsMappedDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId, name: "Under 14s", code: "U14",
            level: Level.Youth, squadSize: SquadSize.ElevenASide);
        var handler = new GetAgeGroupByIdHandler(db.Context);

        var result = await handler.Handle(new GetAgeGroupByIdQuery(ageGroupId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(ageGroupId, result!.Id);
        Assert.Equal(clubId, result.ClubId);
        Assert.Equal("Under 14s", result.Name);
        Assert.Equal("U14", result.Code);
        Assert.Equal("youth", result.Level);
        Assert.Equal("2025-26", result.Season);
        Assert.Equal((int)SquadSize.ElevenASide, result.DefaultSquadSize);
        Assert.False(result.IsArchived);
    }

    [Fact]
    public async Task Handle_ReturnsArchivedAgeGroup()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId, isArchived: true);
        var handler = new GetAgeGroupByIdHandler(db.Context);

        var result = await handler.Handle(new GetAgeGroupByIdQuery(ageGroupId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result!.IsArchived);
    }

    [Theory]
    [InlineData(Level.Youth, "youth")]
    [InlineData(Level.Amateur, "amateur")]
    [InlineData(Level.Reserve, "reserve")]
    [InlineData(Level.Senior, "senior")]
    public async Task Handle_MapsLevelCorrectly(Level level, string expected)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId, level: level);
        var handler = new GetAgeGroupByIdHandler(db.Context);

        var result = await handler.Handle(new GetAgeGroupByIdQuery(ageGroupId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(expected, result!.Level);
    }
}
