using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.AgeGroups.Commands.UpdateAgeGroup;
using OurGame.Application.UseCases.AgeGroups.Commands.UpdateAgeGroup.DTOs;
using OurGame.Persistence.Enums;

namespace OurGame.Application.Tests.AgeGroups;

public class UpdateAgeGroupHandlerTests
{
    [Fact]
    public async Task Handle_WhenAgeGroupNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateAgeGroupHandler(db.Context);
        var dto = MakeDto(Guid.NewGuid());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateAgeGroupCommand(Guid.NewGuid(), dto), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenArchived_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId, isArchived: true);
        var handler = new UpdateAgeGroupHandler(db.Context);
        var dto = MakeDto(clubId);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateAgeGroupCommand(ageGroupId, dto), CancellationToken.None));
        Assert.True(ex.Errors.ContainsKey("AgeGroup"));
    }

    [Fact]
    public async Task Handle_WhenClubNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new UpdateAgeGroupHandler(db.Context);
        var dto = MakeDto(Guid.NewGuid()); // non-existent club

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateAgeGroupCommand(ageGroupId, dto), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenInvalidLevel_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new UpdateAgeGroupHandler(db.Context);
        var dto = MakeDto(clubId, level: "invalid");

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateAgeGroupCommand(ageGroupId, dto), CancellationToken.None));
        Assert.True(ex.Errors.ContainsKey("Level"));
    }

    [Fact]
    public async Task Handle_WhenInvalidSquadSize_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new UpdateAgeGroupHandler(db.Context);
        var dto = MakeDto(clubId, defaultSquadSize: 99);

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateAgeGroupCommand(ageGroupId, dto), CancellationToken.None));
        Assert.True(ex.Errors.ContainsKey("DefaultSquadSize"));
    }

    [Fact]
    public async Task Handle_WhenDefaultSeasonNotInSeasons_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new UpdateAgeGroupHandler(db.Context);
        var dto = MakeDto(clubId, seasons: new List<string> { "2025-26" }, defaultSeason: "2024-25");

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateAgeGroupCommand(ageGroupId, dto), CancellationToken.None));
        Assert.True(ex.Errors.ContainsKey("DefaultSeason"));
    }

    [Fact]
    public async Task Handle_ValidUpdate_ReturnsUpdatedDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new UpdateAgeGroupHandler(db.Context);
        var dto = MakeDto(clubId, name: "Under 15s", code: "U15", level: "Youth",
            season: "2025-26", defaultSquadSize: (int)SquadSize.ElevenASide,
            seasons: new List<string> { "2025-26", "2024-25" }, defaultSeason: "2025-26");

        var result = await handler.Handle(new UpdateAgeGroupCommand(ageGroupId, dto), CancellationToken.None);

        Assert.Equal(ageGroupId, result.Id);
        Assert.Equal(clubId, result.ClubId);
        Assert.Equal("Under 15s", result.Name);
        Assert.Equal("U15", result.Code);
        Assert.Equal("youth", result.Level);
        Assert.Equal("2025-26", result.Season);
        Assert.Equal("2025-26", result.DefaultSeason);
        Assert.Equal((int)SquadSize.ElevenASide, result.DefaultSquadSize);
    }

    [Theory]
    [InlineData("Youth")]
    [InlineData("Amateur")]
    [InlineData("Reserve")]
    [InlineData("Senior")]
    public async Task Handle_AllLevelsValid(string level)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var ageGroupId = await db.SeedAgeGroupAsync(clubId);
        var handler = new UpdateAgeGroupHandler(db.Context);
        var dto = MakeDto(clubId, level: level);

        var result = await handler.Handle(new UpdateAgeGroupCommand(ageGroupId, dto), CancellationToken.None);

        Assert.Equal(level.ToLowerInvariant(), result.Level);
    }

    private static UpdateAgeGroupRequestDto MakeDto(
        Guid clubId,
        string name = "U14",
        string code = "u14",
        string level = "Youth",
        string season = "2025-26",
        int defaultSquadSize = (int)SquadSize.ElevenASide,
        List<string>? seasons = null,
        string? defaultSeason = null) =>
        new()
        {
            ClubId = clubId,
            Name = name,
            Code = code,
            Level = level,
            Season = season,
            DefaultSquadSize = defaultSquadSize,
            Seasons = seasons,
            DefaultSeason = defaultSeason
        };
}
