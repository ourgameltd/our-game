namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

public record PrinciplePositionOverrideDto
{
    public int PositionIndex { get; init; }
    public double? XCoord { get; init; }
    public double? YCoord { get; init; }
    public string? Direction { get; init; }
}
