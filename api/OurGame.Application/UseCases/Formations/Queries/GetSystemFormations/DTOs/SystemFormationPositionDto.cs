namespace OurGame.Application.UseCases.Formations.Queries.GetSystemFormations.DTOs;

/// <summary>
/// Ordered position data for a system formation.
/// </summary>
public class SystemFormationPositionDto
{
    public int PositionIndex { get; set; }
    public string Position { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public string? Direction { get; set; }
}