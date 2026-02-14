namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

/// <summary>
/// DTO for a tactic principle
/// </summary>
public class TacticPrincipleDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<int> PositionIndices { get; set; } = new();
}
