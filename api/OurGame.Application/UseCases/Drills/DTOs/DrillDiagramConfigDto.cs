namespace OurGame.Application.UseCases.Drills.DTOs;

/// <summary>
/// Flexible JSON-backed drill diagram configuration.
/// </summary>
public class DrillDiagramConfigDto
{
    public int SchemaVersion { get; set; } = 1;

    public List<DrillDiagramFrameDto> Frames { get; set; } = new();

    public Dictionary<string, object?>? Meta { get; set; }
}

public class DrillDiagramFrameDto
{
    public string Id { get; set; } = "frame-1";

    public string? Name { get; set; }

    public Dictionary<string, object?>? Pitch { get; set; }

    public List<Dictionary<string, object?>> Objects { get; set; } = new();
}
