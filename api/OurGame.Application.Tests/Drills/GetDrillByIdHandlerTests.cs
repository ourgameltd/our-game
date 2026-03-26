using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Drills.Queries.GetDrillById;

namespace OurGame.Application.Tests.Drills;

public class GetDrillByIdHandlerTests
{
    [Fact]
    public async Task Handle_WhenNotFound_ReturnsNull()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new GetDrillByIdHandler(db.Context);

        var result = await handler.Handle(new GetDrillByIdQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenDrillExists_ReturnsMappedDto()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, _) = await db.SeedCoachAsync(clubId: clubId);
        var drillId = await db.SeedDrillAsync(coachId: coachId, name: "Rondo");

        var handler = new GetDrillByIdHandler(db.Context);
        var result = await handler.Handle(new GetDrillByIdQuery(drillId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(drillId, result.Id);
        Assert.Equal("Rondo", result.Name);
        Assert.Equal("Technical", result.Category);
        Assert.Equal(coachId, result.CreatedBy);
    }

    [Fact]
    public async Task Handle_IncludesLinks()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var drillId = await db.SeedDrillAsync();

        db.Context.DrillLinks.Add(new OurGame.Persistence.Models.DrillLink
        {
            Id = Guid.NewGuid(),
            DrillId = drillId,
            Url = "https://youtube.com/watch?v=123",
            Title = "Tutorial",
            Type = OurGame.Persistence.Enums.LinkType.Youtube
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetDrillByIdHandler(db.Context);
        var result = await handler.Handle(new GetDrillByIdQuery(drillId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Single(result.Links);
        Assert.Equal("https://youtube.com/watch?v=123", result.Links[0].Url);
        Assert.Equal("Tutorial", result.Links[0].Title);
        Assert.Equal("Youtube", result.Links[0].LinkType);
    }

    [Fact]
    public async Task Handle_IncludesScopeLinks()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var drillId = await db.SeedDrillAsync();

        db.Context.Set<OurGame.Persistence.Models.DrillClub>().Add(new OurGame.Persistence.Models.DrillClub
        {
            Id = Guid.NewGuid(),
            DrillId = drillId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new GetDrillByIdHandler(db.Context);
        var result = await handler.Handle(new GetDrillByIdQuery(drillId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Contains(clubId, result.Scope.ClubIds);
    }

    [Fact]
    public async Task Handle_ParsesJsonArrayFields()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var drillId = await db.SeedDrillAsync();

        // Update the drill to have JSON arrays
        var drill = await db.Context.Drills.FindAsync(drillId);
        Assert.NotNull(drill);
        drill!.Attributes = "[\"passing\",\"movement\"]";
        drill.Equipment = "[\"cones\",\"balls\"]";
        drill.Instructions = "[\"Step 1\",\"Step 2\"]";
        drill.Variations = "[\"Easy\",\"Hard\"]";
        await db.Context.SaveChangesAsync();

        var handler = new GetDrillByIdHandler(db.Context);
        var result = await handler.Handle(new GetDrillByIdQuery(drillId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(new List<string> { "passing", "movement" }, result.Attributes);
        Assert.Equal(new List<string> { "cones", "balls" }, result.Equipment);
        Assert.Equal(new List<string> { "Step 1", "Step 2" }, result.Instructions);
        Assert.Equal(new List<string> { "Easy", "Hard" }, result.Variations);
    }
}
