namespace OurGame.Application.UseCases.Tactics.Queries.GetTacticById.DTOs;

/// <summary>
/// Full detail DTO for a single tactic
/// </summary>
public class TacticDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? ParentFormationId { get; set; }
    public string? ParentFormationName { get; set; }
    public Guid? ParentTacticId { get; set; }
    public string? ParentTacticName { get; set; }
    public int SquadSize { get; set; }
    public string? Summary { get; set; }
    public string? Description { get; set; }
    public string? Style { get; set; }
    public List<string> Tags { get; set; } = new();
    public TacticScopeDto Scope { get; set; } = new();
    public List<PositionOverrideDto> PositionOverrides { get; set; } = new();
    public List<TacticPrincipleDto> Principles { get; set; } = new();
    
    /// <summary>
    /// The fully resolved positions with inheritance applied from base formation and parent tactics
    /// </summary>
    public List<ResolvedPositionDto> ResolvedPositions { get; set; } = new();
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
