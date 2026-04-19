using System.Text.Json;

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
    public async Task Handle_WhenDiagramConfigContainsMarkerAndMannequin_PreservesDiagramConfig()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var drillId = await db.SeedDrillAsync();

        var handler = new UpdateDrillHandler(db.Context);
        var dto = ValidDto() with
        {
            DrillDiagramConfig = CreateDiagramConfig()
        };

        var result = await handler.Handle(new UpdateDrillCommand(drillId, "user1", dto), CancellationToken.None);

        Assert.NotNull(result.DrillDiagramConfig);
        Assert.Equal(1, result.DrillDiagramConfig!.Frames.Count);

        var frame = result.DrillDiagramConfig.Frames[0];
        Assert.Equal("frame-1", frame.Id);
        Assert.Equal("Defensive Line", frame.Name);
        Assert.Equal("full", GetString(frame.Pitch!, "mode"));
        Assert.False(GetBoolean(frame.Pitch!, "showGrid"));
        Assert.Equal(2, frame.Objects.Count);

        var marker = frame.Objects[0];
        Assert.Equal("marker", GetString(marker, "type"));
        Assert.Equal("Recover", GetString(marker, "label"));
        Assert.Equal(58, GetDouble(marker, "x"));
        Assert.Equal(41, GetDouble(marker, "y"));
        Assert.Equal(1.2, GetDouble(marker, "size"));

        var mannequin = frame.Objects[1];
        Assert.Equal("mannequin", GetString(mannequin, "type"));
        Assert.Equal(3.2, GetDouble(mannequin, "width"));
        Assert.Equal(8, GetDouble(mannequin, "height"));

        var metadata = GetObject(mannequin, "metadata");
        Assert.Equal("screen", GetString(metadata, "role"));
        Assert.Equal(new[] { "central-lane", "pressing-line" }, GetStringArray(metadata, "zones"));

        var storedDrill = await db.Context.Drills.FindAsync(drillId);
        Assert.NotNull(storedDrill);
    await db.Context.Entry(storedDrill!).ReloadAsync();
        Assert.False(string.IsNullOrWhiteSpace(storedDrill!.DrillDiagramConfig));

        using var persistedJson = JsonDocument.Parse(storedDrill.DrillDiagramConfig);
        var root = persistedJson.RootElement;
        Assert.Equal(2, root.GetProperty("schemaVersion").GetInt32());
        Assert.Equal("drill-editor", root.GetProperty("meta").GetProperty("editor").GetString());

        var persistedFrame = root.GetProperty("frames").EnumerateArray().Single();
        var persistedObjects = persistedFrame.GetProperty("objects").EnumerateArray().ToArray();
        Assert.Equal("marker", persistedObjects[0].GetProperty("type").GetString());
        Assert.Equal("Recover", persistedObjects[0].GetProperty("label").GetString());
        Assert.Equal(1.2, persistedObjects[0].GetProperty("size").GetDouble());
        Assert.Equal("mannequin", persistedObjects[1].GetProperty("type").GetString());
        Assert.Equal(3.2, persistedObjects[1].GetProperty("width").GetDouble());
        Assert.Equal(8, persistedObjects[1].GetProperty("height").GetDouble());
        Assert.Equal("screen", persistedObjects[1].GetProperty("metadata").GetProperty("role").GetString());
        Assert.Equal(new[] { "central-lane", "pressing-line" }, persistedObjects[1].GetProperty("metadata").GetProperty("zones").EnumerateArray().Select(zone => zone.GetString()).ToArray());
    }

    private static DrillDiagramConfigDto CreateDiagramConfig() => new()
    {
        SchemaVersion = 2,
        Meta = new Dictionary<string, object?>
        {
            ["editor"] = "drill-editor",
            ["snapToGrid"] = false
        },
        Frames = new List<DrillDiagramFrameDto>
        {
            new()
            {
                Id = "frame-1",
                Name = "Defensive Line",
                Pitch = new Dictionary<string, object?>
                {
                    ["mode"] = "full",
                    ["showGrid"] = false
                },
                Objects = new List<Dictionary<string, object?>>
                {
                    new()
                    {
                        ["id"] = "marker-2",
                        ["type"] = "marker",
                        ["label"] = "Recover",
                        ["color"] = "#0a84ff",
                        ["x"] = 58,
                        ["y"] = 41,
                        ["size"] = 1.2
                    },
                    new()
                    {
                        ["id"] = "mannequin-2",
                        ["type"] = "mannequin",
                        ["style"] = "screen",
                        ["x"] = 61,
                        ["y"] = 37,
                        ["width"] = 3.2,
                        ["height"] = 8,
                        ["metadata"] = new Dictionary<string, object?>
                        {
                            ["role"] = "screen",
                            ["zones"] = new[] { "central-lane", "pressing-line" }
                        }
                    }
                }
            }
        }
    };

    private static JsonElement GetRequiredElement(Dictionary<string, object?> values, string key)
    {
        Assert.True(values.TryGetValue(key, out var value));
        return Assert.IsType<JsonElement>(value);
    }

    private static string? GetString(Dictionary<string, object?> values, string key) =>
        GetRequiredElement(values, key).GetString();

    private static bool GetBoolean(Dictionary<string, object?> values, string key) =>
        GetRequiredElement(values, key).GetBoolean();

    private static double GetDouble(Dictionary<string, object?> values, string key) =>
        GetRequiredElement(values, key).GetDouble();

    private static Dictionary<string, object?> GetObject(Dictionary<string, object?> values, string key) =>
        JsonSerializer.Deserialize<Dictionary<string, object?>>(GetRequiredElement(values, key).GetRawText())!;

    private static string?[] GetStringArray(Dictionary<string, object?> values, string key) =>
        GetRequiredElement(values, key).EnumerateArray().Select(item => item.GetString()).ToArray();
}
