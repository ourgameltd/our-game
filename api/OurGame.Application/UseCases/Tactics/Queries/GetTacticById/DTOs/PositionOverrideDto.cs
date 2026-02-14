namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

/// <summary>
/// DTO for a tactic position override
/// </summary>
public class PositionOverrideDto
{
    public Guid Id { get; set; }
    public int PositionIndex { get; set; }
    public decimal? XCoord { get; set; }
    public decimal? YCoord { get; set; }
    public string? Direction { get; set; }
}
