using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Drills.DTOs;
using OurGame.Application.UseCases.Drills.Commands.UpdateDrill;
using OurGame.Application.UseCases.Drills.Commands.UpdateDrill.DTOs;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.Drills;

public class UpdateDrillHandlerTests
{
    private static UpdateDrillRequestDto ValidDto() => new()
    {
        Name = "Updated Drill",
        Description = "Updated description",
        DurationMinutes = 20,
        Category = "Game Related Practice",
        Attributes = new List<string> { "passing" },
        Equipment = new List<string> { "cones" },
        Instructions = new List<string> { "Step 1" },
        Variations = new List<string> { "Easy" },
        Links = new List<UpdateDrillLinkDto>(),
        IsPublic = true
    };

    [Fact]
    public async Task Handle_WhenNameEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateDrillHandler(db.Context);

        var dto = ValidDto() with { Name = "  " };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateDrillCommand(Guid.NewGuid(), "user1", dto), CancellationToken.None));
        Assert.Contains("Name", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenCategoryEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateDrillHandler(db.Context);

        var dto = ValidDto() with { Category = "  " };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateDrillCommand(Guid.NewGuid(), "user1", dto), CancellationToken.None));
        Assert.Contains("Category", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenDrillNotFound_ThrowsNotFoundException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new UpdateDrillHandler(db.Context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.Handle(new UpdateDrillCommand(Guid.NewGuid(), "user1", ValidDto()), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WhenInvalidCategory_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var drillId = await db.SeedDrillAsync();
        var handler = new UpdateDrillHandler(db.Context);

        var dto = ValidDto() with { Category = "invalid" };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new UpdateDrillCommand(drillId, "user1", dto), CancellationToken.None));
        Assert.Contains("Category", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesAndReturnsDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var drillId = await db.SeedDrillAsync();

        // Add a scope link so GetDrillById works
        var clubId = await db.SeedClubAsync();
        db.Context.Set<DrillClub>().Add(new DrillClub
        {
            Id = Guid.NewGuid(),
            DrillId = drillId,
            ClubId = clubId,
            SharedAt = DateTime.UtcNow
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateDrillHandler(db.Context);
        var result = await handler.Handle(new UpdateDrillCommand(drillId, "user1", ValidDto()), CancellationToken.None);

        Assert.Equal("Updated Drill", result.Name);
        Assert.Equal("Updated description", result.Description);
        Assert.Equal(20, result.DurationMinutes);
        Assert.Equal("Game Related Practice", result.Category);
        Assert.True(result.IsPublic);
    }

    [Fact]
    public async Task Handle_ReplacesLinks()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var drillId = await db.SeedDrillAsync();

        // Add an existing link
        db.Context.DrillLinks.Add(new DrillLink
        {
            Id = Guid.NewGuid(),
            DrillId = drillId,
            Url = "https://old.com",
            Title = "Old",
            Type = OurGame.Persistence.Enums.LinkType.Website
        });
        await db.Context.SaveChangesAsync();

        var handler = new UpdateDrillHandler(db.Context);
        var dto = ValidDto() with
        {
            Links = new List<UpdateDrillLinkDto>
            {
                new() { Url = "https://new.com", Title = "New", Type = "youtube" }
            }
        };

        var result = await handler.Handle(new UpdateDrillCommand(drillId, "user1", dto), CancellationToken.None);

        Assert.Single(result.Links);
        Assert.Equal("https://new.com", result.Links[0].Url);
    }

    [Theory]
    [InlineData("Drill", "Drill")]
    [InlineData("Skills Practice", "Skills Practice")]
    [InlineData("Game Related Practice", "Game Related Practice")]
    [InlineData("Conditioned Game", "Conditioned Game")]
    [InlineData("technical", "Skills Practice")]
    [InlineData("tactical", "Game Related Practice")]
    [InlineData("physical", "Conditioned Game")]
    [InlineData("mental", "Drill")]
    [InlineData("mixed", "Drill")]
    public async Task Handle_AllValidCategories(string input, string expected)
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var drillId = await db.SeedDrillAsync();

        var handler = new UpdateDrillHandler(db.Context);
        var dto = ValidDto() with { Category = input };
        var result = await handler.Handle(new UpdateDrillCommand(drillId, "user1", dto), CancellationToken.None);

        Assert.Equal(expected, result.Category);
    }

    [Fact]
    public async Task Handle_WhenDiagramConfigHasMultipleFrames_SavesDiagramConfig()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var drillId = await db.SeedDrillAsync();

        var handler = new UpdateDrillHandler(db.Context);
        var dto = ValidDto() with
        {
            DrillDiagramConfig = new DrillDiagramConfigDto
            {
                SchemaVersion = 1,
                Frames = new List<DrillDiagramFrameDto>
                {
                    new() { Id = "frame-1" },
                    new() { Id = "frame-2" }
                }
            }
        };

        var result = await handler.Handle(new UpdateDrillCommand(drillId, "user1", dto), CancellationToken.None);

        Assert.NotNull(result.DrillDiagramConfig);
        Assert.Equal(2, result.DrillDiagramConfig!.Frames.Count);
    }
}
