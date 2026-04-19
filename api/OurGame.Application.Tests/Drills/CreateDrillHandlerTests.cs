using System.Text.Json;

using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Tests.TestInfrastructure;
using OurGame.Application.UseCases.Drills.Commands.CreateDrill;
using OurGame.Application.UseCases.Drills.Commands.CreateDrill.DTOs;
using OurGame.Application.UseCases.Drills.DTOs;

namespace OurGame.Application.Tests.Drills;

public class CreateDrillHandlerTests
{
    [Fact]
    public async Task Handle_WhenNameEmpty_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "",
            Category = "Skills Practice",
            Scope = new CreateDrillScopeDto { ClubId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("Name", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenInvalidCategory_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "My Drill",
            Category = "invalid",
            Scope = new CreateDrillScopeDto { ClubId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("Category", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenNoScope_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "My Drill",
            Category = "Skills Practice",
            Scope = new CreateDrillScopeDto() // all empty
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("Scope", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenMultipleScopes_ThrowsValidationException()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "My Drill",
            Category = "Skills Practice",
            Scope = new CreateDrillScopeDto { ClubId = Guid.NewGuid(), TeamId = Guid.NewGuid() }
        };

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            handler.Handle(new CreateDrillCommand(dto, "user1"), CancellationToken.None));
        Assert.Contains("Scope", ex.Errors.Keys);
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesDrillAndReturnsDetail()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (coachId, userId) = await db.SeedCoachAsync(clubId: clubId);

        // Get user's authId
        var user = await db.Context.Users.FindAsync(userId);
        Assert.NotNull(user);

        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "Rondo 4v2",
            Description = "Passing drill in a box",
            DurationMinutes = 15,
            Category = "Skills Practice",
            Attributes = new List<string> { "passing", "movement" },
            Equipment = new List<string> { "cones", "balls" },
            Instructions = new List<string> { "Form a circle", "Keep ball" },
            Variations = new List<string> { "2-touch", "1-touch" },
            IsPublic = true,
            Scope = new CreateDrillScopeDto { ClubId = clubId },
            Links = new List<CreateDrillLinkDto>
            {
                new() { Url = "https://youtube.com/rondo", Title = "Tutorial", LinkType = "youtube" }
            }
        };

        var result = await handler.Handle(new CreateDrillCommand(dto, user!.AuthId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Rondo 4v2", result.Name);
        Assert.Equal("Passing drill in a box", result.Description);
        Assert.Equal(15, result.DurationMinutes);
        Assert.Equal("Skills Practice", result.Category);
        Assert.True(result.IsPublic);
        Assert.Equal(coachId, result.CreatedBy);
        Assert.Single(result.Links);
        Assert.Contains(clubId, result.Scope.ClubIds);
    }

    [Fact]
    public async Task Handle_WhenDiagramConfigContainsMarkerAndMannequin_PreservesDiagramConfig()
    {
        await using var db = await TestDatabaseFactory.CreateAsync();
        var clubId = await db.SeedClubAsync();
        var (_, userId) = await db.SeedCoachAsync(clubId: clubId);

        var user = await db.Context.Users.FindAsync(userId);
        Assert.NotNull(user);

        var handler = new CreateDrillHandler(db.Context);

        var dto = new CreateDrillRequestDto
        {
            Name = "Rondo 4v2",
            Category = "Skills Practice",
            Scope = new CreateDrillScopeDto { ClubId = clubId },
            DrillDiagramConfig = CreateDiagramConfig()
        };

        var result = await handler.Handle(new CreateDrillCommand(dto, user!.AuthId), CancellationToken.None);

        Assert.NotNull(result.DrillDiagramConfig);
        Assert.Equal(1, result.DrillDiagramConfig!.Frames.Count);

        var frame = result.DrillDiagramConfig.Frames[0];
        Assert.Equal("frame-1", frame.Id);
        Assert.Equal("Pressing Trigger", frame.Name);
        Assert.Equal("half", GetString(frame.Pitch!, "mode"));
        Assert.True(GetBoolean(frame.Pitch!, "showGrid"));
        Assert.Equal(2, frame.Objects.Count);

        var marker = frame.Objects[0];
        Assert.Equal("marker", GetString(marker, "type"));
        Assert.Equal("Start", GetString(marker, "label"));
        Assert.Equal(12.5, GetDouble(marker, "x"));
        Assert.Equal(33.75, GetDouble(marker, "y"));
        Assert.Equal(0.85, GetDouble(marker, "size"));

        var mannequin = frame.Objects[1];
        Assert.Equal("mannequin", GetString(mannequin, "type"));
        Assert.Equal(2.8, GetDouble(mannequin, "width"));
        Assert.Equal(7, GetDouble(mannequin, "height"));

        var metadata = GetObject(mannequin, "metadata");
        Assert.Equal("pressing-trigger", GetString(metadata, "role"));
        Assert.Equal(new[] { "left-half-space", "lane-2" }, GetStringArray(metadata, "zones"));

        var storedDrill = await db.Context.Drills.FindAsync(result.Id);
        Assert.NotNull(storedDrill);
        Assert.False(string.IsNullOrWhiteSpace(storedDrill!.DrillDiagramConfig));

        using var persistedJson = JsonDocument.Parse(storedDrill.DrillDiagramConfig);
        var root = persistedJson.RootElement;
        Assert.Equal(1, root.GetProperty("schemaVersion").GetInt32());
        Assert.Equal("drill-editor", root.GetProperty("meta").GetProperty("editor").GetString());

        var persistedFrame = root.GetProperty("frames").EnumerateArray().Single();
        var persistedObjects = persistedFrame.GetProperty("objects").EnumerateArray().ToArray();
        Assert.Equal("marker", persistedObjects[0].GetProperty("type").GetString());
        Assert.Equal("Start", persistedObjects[0].GetProperty("label").GetString());
        Assert.Equal(0.85, persistedObjects[0].GetProperty("size").GetDouble());
        Assert.Equal("mannequin", persistedObjects[1].GetProperty("type").GetString());
        Assert.Equal(2.8, persistedObjects[1].GetProperty("width").GetDouble());
        Assert.Equal(7, persistedObjects[1].GetProperty("height").GetDouble());
        Assert.Equal("pressing-trigger", persistedObjects[1].GetProperty("metadata").GetProperty("role").GetString());
        Assert.Equal(new[] { "left-half-space", "lane-2" }, persistedObjects[1].GetProperty("metadata").GetProperty("zones").EnumerateArray().Select(zone => zone.GetString()).ToArray());
    }

    private static DrillDiagramConfigDto CreateDiagramConfig() => new()
    {
        SchemaVersion = 1,
        Meta = new Dictionary<string, object?>
        {
            ["editor"] = "drill-editor",
            ["snapToGrid"] = true
        },
        Frames = new List<DrillDiagramFrameDto>
        {
            new()
            {
                Id = "frame-1",
                Name = "Pressing Trigger",
                Pitch = new Dictionary<string, object?>
                {
                    ["mode"] = "half",
                    ["showGrid"] = true
                },
                Objects = new List<Dictionary<string, object?>>
                {
                    new()
                    {
                        ["id"] = "marker-1",
                        ["type"] = "marker",
                        ["label"] = "Start",
                        ["color"] = "#ff3b30",
                        ["x"] = 12.5,
                        ["y"] = 33.75,
                        ["size"] = 0.85
                    },
                    new()
                    {
                        ["id"] = "mannequin-1",
                        ["type"] = "mannequin",
                        ["style"] = "defender",
                        ["x"] = 44,
                        ["y"] = 26,
                        ["width"] = 2.8,
                        ["height"] = 7,
                        ["metadata"] = new Dictionary<string, object?>
                        {
                            ["role"] = "pressing-trigger",
                            ["zones"] = new[] { "left-half-space", "lane-2" }
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
